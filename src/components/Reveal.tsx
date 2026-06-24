import styled, { keyframes } from 'styled-components';
import { useTheme } from '@razorpay/blade/components';
import type { Theme } from '@razorpay/blade/components';
import type { ReactNode } from 'react';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/**
 * Staggered fade-up entrance. Duration and easing come from Blade motion tokens
 * (not magic numbers), and the whole thing is disabled under
 * prefers-reduced-motion for accessibility.
 */
const RevealRoot = styled.div<{ theme: Theme; $delay: number }>(({ theme, $delay }) => ({
  animation: `${fadeUp} ${theme.motion.duration.gentle}ms ${theme.motion.easing.entrance} ${$delay}ms both`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

export const Reveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const { theme } = useTheme();
  return (
    <RevealRoot theme={theme} $delay={delay}>
      {children}
    </RevealRoot>
  );
};
