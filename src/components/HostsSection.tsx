import { Box, Text, Avatar, AvatarGroup, UsersIcon } from '@razorpay/blade/components';
import { SectionHeading } from './SectionHeading';
import type { EventModel } from '../data/event';

/**
 * "Hosted by" avatar list plus the "N going" social-proof line. The going count
 * reuses AvatarGroup with `maxCount` so the overflow ("+N") is handled by Blade.
 */
export const HostsSection = ({ event }: { event: EventModel }) => (
  <Box display="flex" flexDirection="column" gap="spacing.5">
    <SectionHeading icon={UsersIcon}>Hosts</SectionHeading>

    <Box display="flex" flexDirection="column" gap="spacing.4">
      {event.hosts.map((host) => (
        <Box key={host.id} display="flex" flexDirection="row" alignItems="center" gap="spacing.4">
          <Avatar size="medium" name={host.name} src={host.src} color="primary" />
          <Box display="flex" flexDirection="column" gap="spacing.0">
            <Text weight="semibold" color="surface.text.gray.normal">
              {host.name}
            </Text>
            <Text size="small" color="surface.text.gray.muted">
              Host
            </Text>
          </Box>
        </Box>
      ))}
    </Box>

    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap="spacing.4"
      paddingTop="spacing.4"
      borderTopWidth="thin"
      borderTopColor="surface.border.gray.muted"
    >
      <AvatarGroup size="medium" maxCount={4}>
        {event.hosts.map((host) => (
          <Avatar key={host.id} name={host.name} color="primary" />
        ))}
      </AvatarGroup>
      <Box display="flex" flexDirection="column" gap="spacing.0">
        <Text weight="semibold" color="surface.text.gray.normal">
          {event.rsvp.goingCount} going
        </Text>
        <Text size="small" color="surface.text.gray.muted">
          Your kind of people will be there
        </Text>
      </Box>
    </Box>
  </Box>
);
