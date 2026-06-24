import type { EventModel } from '../data/event';

/** Format an ISO datetime as a UTC iCalendar stamp: YYYYMMDDTHHMMSSZ. */
const toICSDate = (iso: string): string => {
  const d = new Date(iso);
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
};

/** Escape characters that are special inside an iCalendar text value. */
const escapeICS = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/**
 * Build a minimal but valid VEVENT and trigger a download.
 * Pure browser APIs — no backend, matching the challenge constraints.
 */
export const downloadICS = (event: EventModel): void => {
  const location = `${event.venue.name}, ${event.venue.area}`;
  const description = `${event.tagline} — ${event.about[0]}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Razorpay//Blade Build Challenge//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:blade-build-challenge-${toICSDate(event.startsAt)}@razorpay`,
    `DTSTART:${toICSDate(event.startsAt)}`,
    `DTEND:${toICSDate(event.endsAt)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'ai-x-design-meetup.ics';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
