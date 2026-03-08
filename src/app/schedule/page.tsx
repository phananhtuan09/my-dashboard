import { ScheduleView } from '@/components/schedule/ScheduleView';

export const metadata = {
  title: 'Weekly Schedule | Personal Planner',
  description: 'Manage your weekly tasks and time slots',
};

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <ScheduleView />
    </div>
  );
}
