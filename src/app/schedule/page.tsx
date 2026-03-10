import { ScheduleView } from '@/components/schedule/ScheduleView';

export const metadata = {
  title: 'Weekly Schedule | Personal Planner',
  description: 'Manage your weekly tasks and time slots',
};

export default function SchedulePage() {
  return (
    <>
      <ScheduleView />
    </>
  );
}
