import { useRef, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Badge,
  Button,
  TextArea,
  Spinner,
  Alert,
  Divider,
  Tabs,
  TabList,
  TabItem,
  TabPanel,
  SparklesIcon,
  ZapIcon,
  LayoutIcon,
  CodeSnippetIcon,
  useToast,
} from '@razorpay/blade/components';
import { Reveal } from '../components/Reveal';
import { track } from '../analytics';
import { RAILS_MIN_WIDTH, useMinWidth } from '../useMinWidth';
import { BlogBanner, BlogCard, StatsCard, StatsStrip } from '../components/ProofPanels';
import { recipes, matchRecipe } from './recipes';
import { SchemaRenderer } from './SchemaRenderer';
import { CodeBlock } from './CodeBlock';
import { parsePartialScreen } from './partialScreen';
import { screenToJsx } from './screenToJsx';
import type { UIScreen } from './uiSchema';

type Status = 'idle' | 'building' | 'done';
type Mode = 'ai' | 'recipe';

const EXAMPLES = [
  'A payment successful screen',
  'A sign-in form',
  'A revenue metrics dashboard',
  'Notification settings',
  'A refund request form',
];

/**
 * LEVEL 2 — prompt → Blade UI, powered by Claude.
 *
 * The prompt is POSTed to /api/generate (a serverless function holding the
 * Anthropic key). Claude returns a structured Blade UI spec, which is rendered
 * with real Blade components + tokens — guaranteed on-system whatever the model
 * writes. The response is streamed (NDJSON), and the preview paints section by
 * section as the JSON arrives. If the API isn't configured, it falls back to
 * local keyword recipes.
 */

/**
 * Read the NDJSON stream from /api/generate, calling onText with the full JSON
 * text received so far after every chunk. Resolves with the complete text.
 */
const readGenerateStream = async (res: Response, onText: (text: string) => void) => {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  let text = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    pending += decoder.decode(value, { stream: true });
    const lines = pending.split('\n');
    pending = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      const msg = JSON.parse(line) as { delta?: string; error?: string; detail?: string };
      if (msg.error) throw new Error(msg.detail ?? msg.error);
      if (msg.delta) {
        text += msg.delta;
        onText(text);
      }
    }
  }
  return text;
};
export const PromptStudio = () => {
  const toast = useToast();
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [mode, setMode] = useState<Mode>('ai');
  const [screen, setScreen] = useState<UIScreen | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [buildKey, setBuildKey] = useState(0);
  // Number of sections last pushed to state — skip re-renders for chunks that
  // don't change what's on screen (most of them).
  const lastShape = useRef('');

  // Grow the prompt box with its content: count hard newlines plus an estimate
  // of wrapped lines (~56 chars/line), clamped to Blade's supported 1–5 range.
  const promptLines = Math.min(
    5,
    Math.max(
      2,
      prompt.split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 56)), 0),
    ),
  ) as 1 | 2 | 3 | 4 | 5;

  const fallbackToRecipe = (value: string) => {
    const match = matchRecipe(value);
    setMode('recipe');
    setScreen(null);
    setRecipeId(match ? match.id : 'fallback');
    return match ? match.id : null;
  };

  const build = async (text: string) => {
    const value = text.trim();
    if (!value) {
      toast.show({ content: 'Type a prompt first', color: 'notice' });
      return;
    }
    setStatus('building');
    setScreen(null);
    setRecipeId(null);
    setNotice(null);
    setBuildKey((k) => k + 1);
    track('prompt_build_started', {
      promptLength: value.length,
      isExample: EXAMPLES.includes(value),
    });
    const startedAt = performance.now();
    let firstPaintMs: number | null = null;
    lastShape.current = '';
    setMode('ai');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: value }),
      });
      if (res.ok && res.body) {
        const text = await readGenerateStream(res, (soFar) => {
          const partial = parsePartialScreen(soFar);
          if (!partial) return;
          // Only repaint when a new finished value has landed.
          const shape = JSON.stringify(partial);
          if (shape === lastShape.current) return;
          lastShape.current = shape;
          if (firstPaintMs === null) firstPaintMs = Math.round(performance.now() - startedAt);
          setScreen(partial);
        });
        const final = JSON.parse(text) as UIScreen;
        setScreen(final);
        track('prompt_build_succeeded', {
          mode: 'ai',
          sectionCount: final.sections?.length ?? 0,
          firstPaintMs,
          totalMs: Math.round(performance.now() - startedAt),
        });
      } else {
        const body = await res.json().catch(() => ({}) as Record<string, unknown>);
        setNotice(`Live AI unavailable (${res.status} ${String(body.error ?? '')}${body.detail ? ` — ${String(body.detail)}` : ''}). Showing an offline build.`);
        const recipeMatch = fallbackToRecipe(value);
        track('prompt_build_fallback', { reason: 'api_error', status: res.status, recipeMatch });
      }
    } catch (err) {
      setNotice(`Live AI unreachable (${err instanceof Error ? err.message : 'network'}). Showing an offline build.`);
      const recipeMatch = fallbackToRecipe(value);
      track('prompt_build_fallback', { reason: 'network_error', recipeMatch });
    } finally {
      setStatus('done');
    }
  };

  const matched = recipeId ? recipes.find((r) => r.id === recipeId) : null;

  // Wide screens: studio on the left, write-up + stats cards in a right rail. Narrower ones fall back to a banner + stats strip above the studio.
  const wide = useMinWidth(RAILS_MIN_WIDTH);

  const studio = (
    <Box display="flex" flexDirection="column" gap="spacing.7" flex={1} minWidth="spacing.0">
      <Box display="flex" flexDirection="column" gap="spacing.3">
        <Heading as="h1" size="xlarge" weight="semibold" color="surface.text.gray.normal">
          Describe it. Claude builds it in Blade.
        </Heading>
        <Text color="surface.text.gray.subtle">
          Your prompt goes to Claude, which returns a structured design — rendered live with
          real Blade components and tokens. No raw hex, no magic pixels, whatever you ask for.
        </Text>
      </Box>

      <Box
        backgroundColor="surface.background.gray.intense"
        borderRadius="large"
        borderWidth="thin"
        borderColor="surface.border.gray.muted"
        elevation="lowRaised"
        padding={{ base: 'spacing.5', m: 'spacing.6' }}
        display="flex"
        flexDirection="column"
        gap="spacing.5"
      >
        <TextArea
          label="Your prompt"
          placeholder="e.g. a checkout summary with order items, total, and a pay button"
          value={prompt}
          numberOfLines={promptLines}
          maxCharacters={500}
          onChange={({ value }) => setPrompt(value ?? '')}
        />
        <Box display="flex" flexDirection={{ base: 'column', m: 'row' }} gap="spacing.4" alignItems={{ base: 'stretch', m: 'center' }} justifyContent="space-between">
          <Box display="flex" flexDirection="row" flexWrap="wrap" gap="spacing.3" flex={1} minWidth="spacing.0">
            {EXAMPLES.map((ex) => (
              <Button key={ex} variant="tertiary" size="xsmall" isDisabled={status === 'building'} onClick={() => { setPrompt(ex); build(ex); }}>
                {ex}
              </Button>
            ))}
          </Box>
          <Box flexShrink={0}>
            <Button icon={ZapIcon} iconPosition="left" isFullWidth isLoading={status === 'building'} onClick={() => build(prompt)}>
              Build it
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box display="flex" flexDirection="column" gap="spacing.5" minHeight="320px">
        {status === 'idle' ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.3" paddingY="spacing.10">
            <SparklesIcon size="large" color="surface.icon.gray.muted" />
            <Text color="surface.text.gray.muted">Your build will appear here</Text>
          </Box>
        ) : null}

        {status === 'building' && !screen ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.4" paddingY="spacing.10">
            <Spinner accessibilityLabel="Designing your screen" size="large" color="primary" />
            <Text color="surface.text.gray.muted">Claude is designing in Blade…</Text>
          </Box>
        ) : null}

        {status === 'done' || (status === 'building' && screen) ? (
          // Same node from first streamed section through to "Built", so the
          // tabs and already-rendered sections are never remounted mid-stream.
          <Box key={buildKey} display="flex" flexDirection="column" gap="spacing.5">
              {mode === 'recipe' && notice ? (
                <Alert isFullWidth color="notice" title="Couldn't reach Claude" description={notice} isDismissible={false} />
              ) : null}
              <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3" flexWrap="wrap">
                {status === 'building' ? (
                  <Badge color="information" emphasis="intense">Designing…</Badge>
                ) : (
                  <Badge color="positive" emphasis="intense">Built</Badge>
                )}
                <Text size="small" color="surface.text.gray.muted">
                  {mode === 'ai'
                    ? status === 'building'
                      ? 'Streaming from Claude · rendering in Blade as it arrives'
                      : 'Generated by Claude · rendered in Blade'
                    : matched
                      ? `Offline fallback · ${matched.label}`
                      : 'Offline fallback · recipe library'}
                </Text>
              </Box>
              {mode === 'ai' && screen ? (
                <Tabs defaultValue="preview" variant="bordered">
                  <TabList>
                    <TabItem value="preview" leading={LayoutIcon}>Preview</TabItem>
                    <TabItem value="code" leading={CodeSnippetIcon}>Code</TabItem>
                  </TabList>
                  <TabPanel value="preview">
                    <Box paddingTop="spacing.6">
                      <SchemaRenderer screen={screen} />
                    </Box>
                  </TabPanel>
                  <TabPanel value="code">
                    <Box paddingTop="spacing.6">
                      <CodeBlock code={screenToJsx(screen)} />
                    </Box>
                  </TabPanel>
                </Tabs>
              ) : matched ? (
                <Reveal>
                  <matched.Component />
                </Reveal>
              ) : (
                <Reveal>
                  <FallbackResult onPick={build} />
                </Reveal>
              )}
          </Box>
        ) : null}
      </Box>
    </Box>
  );

  if (wide) {
    return (
      <Box
        margin="auto"
        maxWidth="1560px"
        width="100%"
        paddingX="spacing.7"
        paddingY="spacing.9"
        display="flex"
        flexDirection="row"
        alignItems="flex-start"
        gap="spacing.8"
      >
        {studio}
        <Box
          width="300px"
          flexShrink={0}
          position="sticky"
          top="spacing.11"
          alignSelf="flex-start"
          display="flex"
          flexDirection="column"
          gap="spacing.5"
        >
          <BlogCard />
          <StatsCard />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      margin="auto"
      maxWidth="1120px"
      width="100%"
      paddingX={{ base: 'spacing.5', m: 'spacing.7' }}
      paddingY={{ base: 'spacing.7', m: 'spacing.9' }}
      display="flex"
      flexDirection="column"
      gap="spacing.6"
    >
      <BlogBanner />
      <StatsStrip />
      {studio}
    </Box>
  );
};

const FallbackResult = ({ onPick }: { onPick: (text: string) => void }) => (
  <Box width="100%" maxWidth="560px" marginX="auto" backgroundColor="surface.background.gray.intense" borderRadius="large" borderWidth="thin" borderColor="surface.border.gray.muted" padding="spacing.6" display="flex" flexDirection="column" gap="spacing.4">
    <Heading as="h2" size="small" weight="semibold" color="surface.text.gray.normal">
      I can build any of these in Blade
    </Heading>
    <Box display="flex" flexDirection="column" gap="spacing.3">
      {recipes.map((r) => (
        <Box key={r.id} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="spacing.4">
          <Box display="flex" flexDirection="column" gap="spacing.0">
            <Text weight="semibold" color="surface.text.gray.normal">{r.label}</Text>
            <Text size="small" color="surface.text.gray.muted">{r.blurb}</Text>
          </Box>
          <Button variant="tertiary" size="small" onClick={() => onPick(r.keywords[0])}>Build</Button>
        </Box>
      ))}
    </Box>
  </Box>
);
