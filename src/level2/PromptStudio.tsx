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

type Status = 'idle' | 'building' | 'done';

const EXAMPLES = [
  'A payment successful screen',
  'A sign-in form',
  'Pricing plans',
  'A metrics dashboard',
  'Notification settings',
  'A feedback form',
];

/**
 * LEVEL 2 — prompt → Blade UI.
 *
 * The user types a prompt; the studio detects intent and composes a real Blade
 * recipe live (with a build/loading state). Deterministic and backend-free, but
 * a genuine "prompt builds it in Blade" flow — and a systems-thinking statement:
 * a prompt-driven, on-system component library.
 */
export const PromptStudio = () => {
  const toast = useToast();
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [buildKey, setBuildKey] = useState(0);

  const build = (text: string) => {
    const value = text.trim();
    if (!value) {
      toast.show({ content: 'Type a prompt first', color: 'notice' });
      return;
    }
    setStatus('building');
    setRecipeId(null);
    // Brief, intentional delay so the "composing" state reads as real work.
    window.setTimeout(() => {
      const match = matchRecipe(value);
      setRecipeId(match ? match.id : 'fallback');
      setStatus('done');
      setBuildKey((k) => k + 1);
    }, 850);
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
      {/* Intro */}
      <Box display="flex" flexDirection="column" gap="spacing.3">
        <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">
          <Badge color="primary" emphasis="intense" icon={SparklesIcon}>
            Level 2
          </Badge>
          <Text color="surface.text.gray.muted">Freestyle · prompt → Blade</Text>
        </Box>
        <Heading as="h1" size="xlarge" weight="semibold" color="surface.text.gray.normal">
          Describe it. We build it in Blade.
        </Heading>
        <Text color="surface.text.gray.subtle">
          Type a screen or component and the studio composes it live — every pixel a Blade
          component and token, no raw hex.
        </Text>
      </Box>

      {/* Composer */}
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
          placeholder="e.g. a payment successful screen with amount and receipt actions"
          value={prompt}
          maxCharacters={140}
          onChange={({ value }) => setPrompt(value ?? '')}
        />

        <Box display="flex" flexDirection={{ base: 'column', m: 'row' }} gap="spacing.4" alignItems={{ base: 'stretch', m: 'center' }} justifyContent="space-between">
          <Box display="flex" flexDirection="row" flexWrap="wrap" gap="spacing.3">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex}
                variant="tertiary"
                size="xsmall"
                onClick={() => {
                  setPrompt(ex);
                  build(ex);
                }}
              >
                {ex}
              </Button>
            ))}
          </Box>
          <Button
            icon={ZapIcon}
            iconPosition="left"
            isLoading={status === 'building'}
            onClick={() => build(prompt)}
          >
            Build it
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Canvas */}
      <Box display="flex" flexDirection="column" gap="spacing.5" minHeight="320px">
        {status === 'idle' ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.3" paddingY="spacing.10">
            <SparklesIcon size="large" color="surface.icon.gray.muted" />
            <Text color="surface.text.gray.muted">Your build will appear here</Text>
          </Box>
        ) : null}

        {status === 'building' ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.4" paddingY="spacing.10">
            <Spinner accessibilityLabel="Composing your build" size="large" color="primary" />
            <Text color="surface.text.gray.muted">Composing with Blade…</Text>
          </Box>
        ) : null}

        {status === 'done' ? (
          <Reveal key={buildKey}>
            <Box display="flex" flexDirection="column" gap="spacing.5">
              <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3" flexWrap="wrap">
                <Badge color="positive" emphasis="intense">Built</Badge>
                <Text size="small" color="surface.text.gray.muted">
                  {matched ? `Interpreted as · ${matched.label}` : 'No exact match — showing the recipe library'}
                </Text>
              </Box>
              {matched ? <matched.Component /> : <FallbackResult onPick={build} />}
            </Box>
          </Reveal>
        ) : null}
      </Box>
    </Box>
  );
};

/** Shown when no keyword matches — guides the user to what the studio can build. */
const FallbackResult = ({ onPick }: { onPick: (text: string) => void }) => (
  <Box
    width="100%"
    maxWidth="560px"
    marginX="auto"
    backgroundColor="surface.background.gray.intense"
    borderRadius="large"
    borderWidth="thin"
    borderColor="surface.border.gray.muted"
    padding="spacing.6"
    display="flex"
    flexDirection="column"
    gap="spacing.4"
  >
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
          <Button variant="tertiary" size="small" onClick={() => onPick(r.keywords[0])}>
            Build
          </Button>
        </Box>
      ))}
    </Box>
  </Box>
);
