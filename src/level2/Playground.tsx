import { Box, Heading, Text, Badge } from '@razorpay/blade/components';
import { PaymentSuccess } from './PaymentSuccess';

/**
 * LEVEL 2 — Freestyle sandbox.
 *
 * The prompt is the variable; Blade is the constant. When the prompt drops,
 * build it INSIDE the <Box> below. Everything here already lives under the same
 * <BladeProvider> as Level 1, so tokens, theming and the dark-mode toggle all
 * work for free.
 *
 * On-system checklist (keep this honest under judging):
 *   • components from '@razorpay/blade/components' — never a raw <div>/<button>
 *   • spacing/gap/padding via spacing.* tokens — never magic px
 *   • colour via surface.* / feedback.* / interactive.* tokens — never raw hex
 *   • one obvious primary action; label every control; ≥44px targets
 *   • responsive via { base, m, l } props; test the dark toggle
 */
export const Playground = () => (
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
    <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">
      <Badge color="primary" emphasis="intense">
        Level 2
      </Badge>
      <Text color="surface.text.gray.muted">Freestyle · Blade-native sandbox</Text>
    </Box>

    <Box display="flex" flexDirection="column" gap="spacing.1">
      <Heading as="h1" size="xlarge" weight="semibold" color="surface.text.gray.normal">
        Sample prompt: “Payment Successful” screen
      </Heading>
      <Text color="surface.text.gray.subtle">
        A dry-run build proving the pipeline. Swap in the real prompt when it drops —
        see <Text as="span" weight="semibold">BLADE_KIT.md</Text>.
      </Text>
    </Box>

    {/* ───────── the on-the-spot build ───────── */}
    <PaymentSuccess />
  </Box>
);
