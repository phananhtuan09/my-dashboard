import { TaskListView } from '@/components/tasks/TaskListView';

export const metadata = {
  title: 'Task Manager | Personal Planner',
  description: 'Manage tasks list',
};

export default function TasksPage() {
  return (
    <>
      <TaskListView />
    </>
  );
}
