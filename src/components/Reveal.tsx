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
// Tagged-template syntax — keyframe interpolation (${fadeUp}) is only supported
// here, not in object syntax (object syntax throws styled-components error #12).
const RevealRoot = styled.div<{ theme: Theme; $delay: number }>`
  animation: ${fadeUp} ${({ theme }) => theme.motion.duration.gentle}ms
    ${({ theme }) => theme.motion.easing.entrance} ${({ $delay }) => $delay}ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Reveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const { theme } = useTheme();
  return (
    <RevealRoot theme={theme} $delay={delay}>
      {children}
    </RevealRoot>
  );
};
