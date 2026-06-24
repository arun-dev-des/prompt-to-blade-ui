import {
  Box,
  Text,
  Heading,
  Badge,
  Divider,
  Link,
  CalendarIcon,
  MapPinIcon,
  SparklesIcon,
} from '@razorpay/blade/components';
import type { EventModel } from '../data/event';
import { EventCover } from './EventCover';
import { MetaRow } from './MetaRow';
import { RegistrationCard } from './RegistrationCard';
import { AboutSection } from './AboutSection';
import { ScheduleSection } from './ScheduleSection';
import { HostsSection } from './HostsSection';
import { Reveal } from './Reveal';

/** Title + tagline + the at-a-glance host line. Full width above the columns. */
const TitleBlock = ({ event }: { event: EventModel }) => (
  <Box display="flex" flexDirection="column" gap="spacing.4">
    <Box display="flex" flexDirection="row" gap="spacing.3" alignItems="center" flexWrap="wrap">
      <Badge color="primary" emphasis="intense" icon={SparklesIcon}>
        {event.tagline}
      </Badge>
      <Badge color="information">AI × Design Meetup</Badge>
    </Box>
    <Heading as="h1" size="2xlarge" weight="semibold" color="surface.text.gray.normal">
      {event.title}
    </Heading>
    <Text color="surface.text.gray.subtle">
      Hosted by {event.hosts[0].name} · {event.rsvp.goingCount} going
    </Text>
  </Box>
);

export const EventPage = ({ event }: { event: EventModel }) => (
  <Box
    margin="auto"
    maxWidth="1120px"
    width="100%"
    paddingX={{ base: 'spacing.5', m: 'spacing.7' }}
    paddingY={{ base: 'spacing.7', m: 'spacing.9' }}
    display="flex"
    flexDirection="column"
    gap={{ base: 'spacing.7', m: 'spacing.8' }}
  >
    <Reveal>
      <EventCover />
    </Reveal>

    <Reveal delay={80}>
      <TitleBlock event={event} />
    </Reveal>

    <Reveal delay={140}>
      <Box
        display="flex"
        flexDirection={{ base: 'column', m: 'row' }}
        gap={{ base: 'spacing.5', m: 'spacing.7' }}
      >
        <Box flexGrow={1} flexBasis="0px">
          <MetaRow
            icon={CalendarIcon}
            title={event.dateLabel}
            subtitle={`${event.timeLabel} · ${event.timezoneLabel}`}
          />
        </Box>
        <Box flexGrow={1} flexBasis="0px">
          <MetaRow
            icon={MapPinIcon}
            title={event.venue.name}
            subtitle={event.venue.area}
            trailing={
              <Link
                variant="anchor"
                size="small"
                icon={MapPinIcon}
                iconPosition="right"
                href={event.venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View map
              </Link>
            }
          />
        </Box>
      </Box>
    </Reveal>

    <Divider />

    {/* Two-column body. On mobile the rail (registration + hosts) is ordered
        directly under the meta rows so the primary action stays above the fold. */}
    <Box
      display="flex"
      flexDirection={{ base: 'column', l: 'row' }}
      gap={{ base: 'spacing.8', l: 'spacing.9' }}
      alignItems="flex-start"
    >
      <Box
        order={{ base: 2, l: 1 }}
        flexGrow={1}
        display="flex"
        flexDirection="column"
        gap="spacing.8"
        width="100%"
      >
        <Reveal delay={200}>
          <AboutSection event={event} />
        </Reveal>
        <Divider />
        <Reveal delay={240}>
          <ScheduleSection event={event} />
        </Reveal>
      </Box>

      <Box
        order={{ base: 1, l: 2 }}
        width={{ base: '100%', l: '360px' }}
        flexShrink={0}
        display="flex"
        flexDirection="column"
        gap="spacing.7"
        position={{ base: 'static', l: 'sticky' }}
        top="88px"
      >
        <Reveal delay={120}>
          <RegistrationCard event={event} />
        </Reveal>
        <Reveal delay={260}>
          <HostsSection event={event} />
        </Reveal>
      </Box>
    </Box>
  </Box>
);
