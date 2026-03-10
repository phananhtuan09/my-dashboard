import { DailyChecklistView } from '@/components/daily/DailyChecklistView';

export const metadata = {
  title: 'Daily Checklist | Personal Planner',
  description: 'Track your work completed today',
};

export default function DailyPage() {
  return (
    <>
      <DailyChecklistView />
    </>
  );
}
