import { TaskListView } from '@/components/tasks/TaskListView';

export const metadata = {
  title: 'Task Manager | Personal Planner',
  description: 'Manage tasks list',
};

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <TaskListView />
    </div>
  );
}
