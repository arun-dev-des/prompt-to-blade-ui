import styled from 'styled-components';
import { Box, Text, Heading, Badge, RazorpayIcon, SparklesIcon, useTheme } from '@razorpay/blade/components';
import type { Theme } from '@razorpay/blade/components';

/**
 * The gradient is composed entirely from resolved Blade theme tokens — no raw
 * hex. It reads the primary / sea surface colours from the active theme, so it
 * recolours correctly when the colour scheme flips to dark.
 */
const GradientCanvas = styled.div<{ theme: Theme }>(({ theme }) => {
  const { colors, border } = theme;
  return {
    position: 'relative',
    width: '100%',
    aspectRatio: '3 / 2',
    borderRadius: `${border.radius.large}px`,
    overflow: 'hidden',
    background: `linear-gradient(140deg,
      ${colors.surface.background.primary.intense} 0%,
      ${colors.surface.background.sea.intense} 60%,
      ${colors.surface.background.cloud.intense} 130%)`,
  };
});

/** Soft decorative orb to add depth, sized/positioned with raw layout (purely ornamental). */
const Orb = styled.div<{ theme: Theme }>(({ theme }) => ({
  position: 'absolute',
  width: '52%',
  aspectRatio: '1',
  borderRadius: theme.border.radius.round,
  background: theme.colors.surface.background.cloud.subtle,
  opacity: 0.5,
  filter: 'blur(8px)',
  top: '-18%',
  right: '-10%',
}));

export const EventCover = () => {
  const { theme } = useTheme();

  return (
    <GradientCanvas theme={theme}>
      <Orb theme={theme} />
      <Box
        position="absolute"
        top="spacing.0"
        left="spacing.0"
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        padding={{ base: 'spacing.6', m: 'spacing.7' }}
      >
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">
            <RazorpayIcon size="large" color="surface.icon.staticWhite.normal" />
            <Text weight="semibold" color="surface.text.staticWhite.normal">
              Razorpay
            </Text>
          </Box>
          <Badge color="primary" emphasis="intense" icon={SparklesIcon}>
            Meetup
          </Badge>
        </Box>

        <Box display="flex" flexDirection="column" gap="spacing.2">
          <Text size="small" weight="semibold" color="surface.text.staticWhite.subtle">
            AI × DESIGN
          </Text>
          <Heading as="h1" size="2xlarge" weight="semibold" color="surface.text.staticWhite.normal">
            The Blade Build Challenge
          </Heading>
        </Box>
      </Box>
    </GradientCanvas>
  );
};
