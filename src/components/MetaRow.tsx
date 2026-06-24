import { Box, Text } from '@razorpay/blade/components';
import type { IconComponent } from '@razorpay/blade/components';
import type { ReactNode } from 'react';

export type MetaRowProps = {
  icon: IconComponent;
  /** Bold primary line, e.g. the date. */
  title: string;
  /** Muted supporting line, e.g. the day of week. */
  subtitle?: string;
  /** Optional trailing slot (a link, button, badge). */
  trailing?: ReactNode;
};

/**
 * A single "icon tile + two lines of text" row. Reused for both the date and
 * the location so the two blocks share identical rhythm and alignment.
 */
export const MetaRow = ({ icon: Icon, title, subtitle, trailing }: MetaRowProps) => (
  <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.4">
    <Box
      flexShrink={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="44px"
      height="44px"
      backgroundColor="surface.background.gray.intense"
      borderRadius="medium"
      borderWidth="thin"
      borderColor="surface.border.gray.muted"
    >
      <Icon size="medium" color="surface.icon.gray.normal" />
    </Box>
    <Box flexGrow={1} display="flex" flexDirection="column" gap="spacing.0">
      <Text weight="semibold" color="surface.text.gray.normal">
        {title}
      </Text>
      {subtitle ? (
        <Text size="small" color="surface.text.gray.muted">
          {subtitle}
        </Text>
      ) : null}
    </Box>
    {trailing ? <Box flexShrink={0}>{trailing}</Box> : null}
  </Box>
);
