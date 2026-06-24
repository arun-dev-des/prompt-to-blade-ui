import { Box, Text, InfoIcon } from '@razorpay/blade/components';
import { SectionHeading } from './SectionHeading';
import type { EventModel } from '../data/event';

export const AboutSection = ({ event }: { event: EventModel }) => (
  <Box display="flex" flexDirection="column" gap="spacing.4">
    <SectionHeading icon={InfoIcon}>About this event</SectionHeading>
    <Box display="flex" flexDirection="column" gap="spacing.3">
      {event.about.map((paragraph, index) => (
        <Text key={index} color="surface.text.gray.subtle">
          {paragraph}
        </Text>
      ))}
    </Box>
  </Box>
);
