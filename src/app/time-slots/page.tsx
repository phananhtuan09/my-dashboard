import { TimeSlotListView } from '@/components/time-slots/TimeSlotListView';

export const metadata = {
  title: 'Time Slots | Personal Planner',
  description: 'Manage time slots for your weekly schedule',
};

export default function TimeSlotsPage() {
  return (
    <>
      <TimeSlotListView />
    </>
  );
}
