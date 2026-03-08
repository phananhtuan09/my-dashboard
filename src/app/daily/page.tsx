import { DailyChecklistView } from '@/components/daily/DailyChecklistView';

export const metadata = {
  title: 'Daily Checklist | Personal Planner',
  description: 'Track your work completed today',
};

export default function DailyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <DailyChecklistView />
    </div>
  );
}
