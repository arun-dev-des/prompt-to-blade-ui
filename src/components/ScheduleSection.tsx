import {
  Box,
  StepGroup,
  StepItem,
  StepItemIndicator,
  CalendarIcon,
} from '@razorpay/blade/components';
import { SectionHeading } from './SectionHeading';
import type { EventModel } from '../data/event';

export const ScheduleSection = ({ event }: { event: EventModel }) => {
  const lastIndex = event.schedule.length - 1;

  return (
    <Box display="flex" flexDirection="column" gap="spacing.5">
      <SectionHeading icon={CalendarIcon}>Schedule</SectionHeading>
      <StepGroup orientation="vertical" size="medium">
        {event.schedule.map((item, index) => (
          <StepItem
            key={item.id}
            title={item.title}
            timestamp={item.time}
            description={item.description}
            stepProgress={index === lastIndex ? 'none' : 'full'}
            marker={
              <StepItemIndicator color={index === lastIndex ? 'positive' : 'primary'} />
            }
          />
        ))}
      </StepGroup>
    </Box>
  );
};
