import { useTasks } from '../hooks/useTasks';
import { TaskInput } from '../components/TaskInput';
import { TaskList } from '../components/TaskList';

export function TodoPage() {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleComplete, refetch } = useTasks();
  
  const incompleteTasks = tasks.filter(task => !task.completed);

  return (
    <div className="max-w-4xl mx-auto">
      <TaskInput 
        onAddTask={(title, description, priority, dueDate) => addTask(title, description, priority, dueDate)}
        onRefetch={refetch}
      />
      
      <TaskList
        tasks={incompleteTasks}
        loading={loading}
        onToggleComplete={toggleComplete}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onRefetch={refetch}
      />
    </div>
  );
}