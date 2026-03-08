import { TimeSlotListView } from '@/components/time-slots/TimeSlotListView';

export const metadata = {
  title: 'Time Slots | Personal Planner',
  description: 'Manage time slots for your weekly schedule',
};

export default function TimeSlotsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <TimeSlotListView />
    </div>
  );
}
