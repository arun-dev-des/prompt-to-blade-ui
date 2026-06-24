import { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Badge,
  Button,
  TextArea,
  Spinner,
  Divider,
  SparklesIcon,
  ZapIcon,
  useToast,
} from '@razorpay/blade/components';
import { Reveal } from '../components/Reveal';
import { recipes, matchRecipe } from './recipes';
import { SchemaRenderer } from './SchemaRenderer';
import type { UIScreen } from './uiSchema';

type Status = 'idle' | 'building' | 'done';
type Mode = 'ai' | 'recipe';

const EXAMPLES = [
  'A payment successful screen',
  'A sign-in form',
  'Pricing plans for a SaaS',
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
 * writes. If the API isn't configured, it falls back to local keyword recipes.
 */
export const PromptStudio = () => {
  const toast = useToast();
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [mode, setMode] = useState<Mode>('ai');
  const [screen, setScreen] = useState<UIScreen | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [buildKey, setBuildKey] = useState(0);

  const fallbackToRecipe = (value: string) => {
    const match = matchRecipe(value);
    setMode('recipe');
    setScreen(null);
    setRecipeId(match ? match.id : 'fallback');
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
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: value }),
      });
      if (res.ok) {
        const data = (await res.json()) as { screen: UIScreen };
        setMode('ai');
        setScreen(data.screen);
      } else {
        fallbackToRecipe(value);
      }
    } catch {
      fallbackToRecipe(value);
    } finally {
      setBuildKey((k) => k + 1);
      setStatus('done');
    }
  };

  const matched = recipeId ? recipes.find((r) => r.id === recipeId) : null;

  return (
    <Box
      margin="auto"
      maxWidth="1120px"
      width="100%"
      paddingX={{ base: 'spacing.5', m: 'spacing.7' }}
      paddingY={{ base: 'spacing.7', m: 'spacing.9' }}
      display="flex"
      flexDirection="column"
      gap="spacing.7"
    >
      <Box display="flex" flexDirection="column" gap="spacing.3">
        <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">
          <Badge color="primary" emphasis="intense" icon={SparklesIcon}>
            Level 2
          </Badge>
          <Text color="surface.text.gray.muted">Freestyle · prompt → Blade, by Claude</Text>
        </Box>
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
          maxCharacters={200}
          onChange={({ value }) => setPrompt(value ?? '')}
        />
        <Box display="flex" flexDirection={{ base: 'column', m: 'row' }} gap="spacing.4" alignItems={{ base: 'stretch', m: 'center' }} justifyContent="space-between">
          <Box display="flex" flexDirection="row" flexWrap="wrap" gap="spacing.3">
            {EXAMPLES.map((ex) => (
              <Button key={ex} variant="tertiary" size="xsmall" isDisabled={status === 'building'} onClick={() => { setPrompt(ex); build(ex); }}>
                {ex}
              </Button>
            ))}
          </Box>
          <Button icon={ZapIcon} iconPosition="left" isLoading={status === 'building'} onClick={() => build(prompt)}>
            Build it
          </Button>
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

        {status === 'building' ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.4" paddingY="spacing.10">
            <Spinner accessibilityLabel="Designing your screen" size="large" color="primary" />
            <Text color="surface.text.gray.muted">Claude is designing in Blade…</Text>
          </Box>
        ) : null}

        {status === 'done' ? (
          <Reveal key={buildKey}>
            <Box display="flex" flexDirection="column" gap="spacing.5">
              <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3" flexWrap="wrap">
                <Badge color="positive" emphasis="intense">Built</Badge>
                <Text size="small" color="surface.text.gray.muted">
                  {mode === 'ai'
                    ? 'Generated by Claude · rendered in Blade'
                    : matched
                      ? `Offline fallback · ${matched.label}`
                      : 'Offline fallback · recipe library'}
                </Text>
              </Box>
              {mode === 'ai' && screen ? (
                <SchemaRenderer screen={screen} />
              ) : matched ? (
                <matched.Component />
              ) : (
                <FallbackResult onPick={build} />
              )}
            </Box>
          </Reveal>
        ) : null}
      </Box>
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
