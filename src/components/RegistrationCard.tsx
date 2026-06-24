import { useState } from 'react';
import {
  Box,
  Text,
  Button,
  Badge,
  Divider,
  Indicator,
  TicketIcon,
  CheckCircleIcon,
  CalendarIcon,
  UserPlusIcon,
  CheckIcon,
  ShareIcon,
  useToast,
} from '@razorpay/blade/components';
import type { EventModel } from '../data/event';
import { downloadICS } from '../utils/calendar';

type RegistrationCardProps = {
  event: EventModel;
};

/**
 * The RSVP surface. Because the attendee is already going, the card leads with
 * a confirmed "You're In" state + ticket, then offers exactly one obvious
 * primary action (Add to calendar) and one secondary (Invite a friend).
 */
export const RegistrationCard = ({ event }: RegistrationCardProps) => {
  const toast = useToast();
  const [invited, setInvited] = useState(false);
  const { rsvp } = event;

  const handleAddToCalendar = () => {
    downloadICS(event);
    toast.show({
      content: 'Calendar invite downloaded — see you there!',
      color: 'positive',
    });
  };

  const handleInvite = async () => {
    const shareData = {
      title: event.title,
      text: `Join me at ${event.title} — ${event.dateLabel}, ${event.timeLabel}.`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        toast.show({ content: 'Invite link copied to clipboard', color: 'positive' });
      }
      setInvited(true);
    } catch {
      // User dismissed the share sheet — no-op, keep the card untouched.
    }
  };

  return (
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
      {/* Confirmed state */}
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="spacing.4">
        <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">
          <CheckCircleIcon size="large" color="interactive.icon.positive.normal" />
          <Box display="flex" flexDirection="column" gap="spacing.0">
            <Text weight="semibold" color="surface.text.gray.normal">
              You’re In
            </Text>
            <Text size="small" color="surface.text.gray.muted">
              No further action needed
            </Text>
          </Box>
        </Box>
        <Indicator color="positive" emphasis="intense" accessibilityLabel="Registration confirmed">
          Going
        </Indicator>
      </Box>

      <Divider />

      {/* My Ticket */}
      <Box display="flex" flexDirection="column" gap="spacing.3">
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text size="small" weight="semibold" color="surface.text.gray.subtle">
            My Ticket
          </Text>
          <Badge color="positive" icon={TicketIcon}>
            1 ticket
          </Badge>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap="spacing.4"
          backgroundColor="surface.background.gray.subtle"
          borderRadius="medium"
          borderWidth="thin"
          borderColor="surface.border.gray.muted"
          padding="spacing.4"
        >
          <Box
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="44px"
            height="44px"
            backgroundColor="surface.background.gray.moderate"
            borderRadius="medium"
          >
            <TicketIcon size="medium" color="surface.icon.gray.normal" />
          </Box>
          <Box flexGrow={1} display="flex" flexDirection="column" gap="spacing.0">
            <Text weight="semibold" color="surface.text.gray.normal">
              {rsvp.ticketName}
            </Text>
            <Text size="small" color="surface.text.gray.muted">
              {rsvp.attendeeName} · {rsvp.attendeeEmail}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Primary + secondary actions */}
      <Box display="flex" flexDirection="column" gap="spacing.3">
        <Button isFullWidth icon={CalendarIcon} iconPosition="left" onClick={handleAddToCalendar}>
          Add to Calendar
        </Button>
        <Button
          isFullWidth
          variant="secondary"
          icon={invited ? CheckIcon : UserPlusIcon}
          iconPosition="left"
          onClick={handleInvite}
        >
          {invited ? 'Invite shared' : 'Invite a Friend'}
        </Button>
      </Box>

      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" gap="spacing.2">
        <ShareIcon size="small" color="surface.icon.gray.muted" />
        <Text size="xsmall" color="surface.text.gray.muted">
          Share the link — friends can RSVP in one tap
        </Text>
      </Box>
    </Box>
  );
};
