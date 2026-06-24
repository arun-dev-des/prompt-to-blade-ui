import { useState } from 'react';
import styled from 'styled-components';
import { Box, Text, Button, CopyIcon, CheckIcon, useTheme, useToast } from '@razorpay/blade/components';
import type { Theme } from '@razorpay/blade/components';

/**
 * Read-only code surface. The container uses Blade Box tokens; the <pre> is a
 * styled escape hatch (Blade has no monospace text primitive) whose colour,
 * radius and spacing all resolve from theme tokens — so it stays dark-mode safe.
 */
const Pre = styled.pre<{ theme: Theme }>(({ theme }) => ({
  margin: 0,
  padding: `${theme.spacing[5]}px`,
  overflowX: 'auto',
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: '13px',
  lineHeight: 1.6,
  color: theme.colors.surface.text.gray.subtle,
  background: theme.colors.surface.background.gray.subtle,
  borderRadius: `${theme.border.radius.medium}px`,
}));

export const CodeBlock = ({ code, filename = 'GeneratedScreen.tsx' }: { code: string; filename?: string }) => {
  const toast = useToast();
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.show({ content: 'Code copied to clipboard', color: 'positive' });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.show({ content: "Couldn't copy — select and copy manually", color: 'notice' });
    }
  };

  return (
    <Box
      width="100%"
      maxWidth="640px"
      marginX="auto"
      backgroundColor="surface.background.gray.intense"
      borderRadius="large"
      borderWidth="thin"
      borderColor="surface.border.gray.muted"
      elevation="lowRaised"
      padding="spacing.4"
      display="flex"
      flexDirection="column"
      gap="spacing.3"
    >
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="spacing.4" paddingX="spacing.2">
        <Text size="small" color="surface.text.gray.muted">{filename}</Text>
        <Button
          variant="tertiary"
          size="xsmall"
          icon={copied ? CheckIcon : CopyIcon}
          iconPosition="left"
          onClick={copy}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Box>
      <Pre theme={theme}>{code}</Pre>
    </Box>
  );
};
