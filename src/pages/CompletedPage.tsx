import { useTasks } from '../hooks/useTasks';
import { TaskList } from '../components/TaskList';

export function CompletedPage() {
  const { tasks, loading, updateTask, deleteTask, toggleComplete, refetch } = useTasks();
  
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="max-w-4xl mx-auto">
      <TaskList
        tasks={completedTasks}
        loading={loading}
        onToggleComplete={toggleComplete}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onRefetch={refetch}
        emptyMessage="No completed tasks yet."
      />
    </div>
  );
}