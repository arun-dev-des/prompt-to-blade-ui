import { Box, Heading } from '@razorpay/blade/components';
import type { IconComponent } from '@razorpay/blade/components';

export type SectionHeadingProps = {
  icon?: IconComponent;
  children: string;
};

/** Consistent section title treatment so About / Schedule / Hosts share rhythm. */
export const SectionHeading = ({ icon: Icon, children }: SectionHeadingProps) => (
  <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">
    {Icon ? <Icon size="medium" color="surface.icon.gray.subtle" /> : null}
    <Heading as="h2" size="medium" weight="semibold" color="surface.text.gray.normal">
      {children}
    </Heading>
  </Box>
);
