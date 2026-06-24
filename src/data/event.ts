/**
 * Single source of truth for the event.
 *
 * Every component reads from this object, so the page is fully data-driven:
 * swap the contents here and the entire UI re-renders correctly. Nothing about
 * presentation (colours, spacing, copy styling) lives in this file — only facts.
 */

export type Host = {
  id: string;
  name: string;
  /** Optional avatar image. When omitted, Blade renders initials from `name`. */
  src?: string;
};

export type ScheduleItem = {
  id: string;
  /** Human-readable time, e.g. "7:30 PM". */
  time: string;
  title: string;
  description?: string;
};

export type RsvpState = 'going' | 'not-registered' | 'waitlist';

export type EventModel = {
  title: string;
  tagline: string;
  /** ISO start/end — used for the calendar (.ics) export. */
  startsAt: string;
  endsAt: string;
  /** Pre-formatted, display-ready date/time strings (no client-side i18n needed). */
  dateLabel: string;
  dayLabel: string;
  timeLabel: string;
  timezoneLabel: string;
  venue: {
    name: string;
    area: string;
    mapsUrl: string;
  };
  rsvp: {
    state: RsvpState;
    ticketName: string;
    attendeeName: string;
    attendeeEmail: string;
    goingCount: number;
  };
  hosts: Host[];
  about: string[];
  schedule: ScheduleItem[];
};

export const event: EventModel = {
  title: 'AI × Design Meetup @ Razorpay',
  tagline: 'The Blade Build Challenge',
  startsAt: '2026-06-24T19:30:00+05:30',
  endsAt: '2026-06-24T23:00:00+05:30',
  dateLabel: 'Wed, 24 Jun',
  dayLabel: 'Wednesday, 24 June 2026',
  timeLabel: '7:30 – 11:00 PM',
  timezoneLabel: 'IST (GMT+5:30)',
  venue: {
    name: 'Razorpay Arena Office',
    area: 'Koramangala, Bengaluru',
    mapsUrl: 'https://maps.google.com/?q=Razorpay+Arena+Office+Koramangala',
  },
  rsvp: {
    state: 'going',
    ticketName: 'Standard · Builder Pass',
    attendeeName: 'Arun',
    attendeeEmail: 'arun.dev.des@gmail.com',
    goingCount: 64,
  },
  hosts: [
    { id: 'razorpay-design', name: 'Razorpay Design' },
    { id: 'blade', name: 'Blade by Razorpay' },
    { id: 'ai-guild', name: 'AI Guild' },
    { id: 'community', name: 'BLR Community' },
  ],
  about: [
    'Two levels. One rule: everything ships in Blade — Razorpay’s design system. Build with any AI tool, and every entry is judged on the same five lenses of design quality.',
    'Come for the build, stay for the people. We’ll move between networking, dinner and the 9:30 livestream — bring a laptop, an idea, and your sharpest prompt.',
  ],
  schedule: [
    {
      id: 'doors',
      time: '7:30 PM',
      title: 'Doors open & networking',
      description: 'Grab a badge, find your people, settle in.',
    },
    {
      id: 'kickoff',
      time: '8:15 PM',
      title: 'The Blade Build Challenge — kickoff',
      description: 'Two levels, five lenses, one design system. We explain the rules.',
    },
    {
      id: 'dinner',
      time: '8:45 PM',
      title: 'Dinner & build time',
      description: 'Eat, pair up, and start shipping on Blade.',
    },
    {
      id: 'livestream',
      time: '9:30 PM',
      title: 'Livestream & fireside',
      description: 'Tune in together, then back to building.',
    },
    {
      id: 'wrap',
      time: '11:00 PM',
      title: 'Submissions close & shoutouts',
      description: 'Top three entries get a shoutout on Razorpay’s LinkedIn.',
    },
  ],
};
