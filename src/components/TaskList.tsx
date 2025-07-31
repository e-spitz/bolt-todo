import { useState } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { Task } from '../lib/supabase';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggleComplete: (id: string) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onRefetch?: () => Promise<void>;
  emptyMessage?: string;
}

type SortOption = 'due_date_asc' | 'due_date_desc' | 'priority_high' | 'priority_low' | 'default';
type SortType = 'date' | 'priority' | 'none';
type SortDirection = 'asc' | 'desc';
export function TaskList({ 
  tasks, 
  loading, 
  onToggleComplete, 
  onUpdateTask, 
  onDeleteTask,
  onRefetch,
  emptyMessage = "No tasks yet. Add one above to get started!"
}: TaskListProps) {
  const [sortType, setSortType] = useState<SortType>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Convert new state to old SortOption for compatibility
  const getSortOption = (): SortOption => {
    if (sortType === 'none') return 'default';
    if (sortType === 'date') return sortDirection === 'asc' ? 'due_date_asc' : 'due_date_desc';
    if (sortType === 'priority') return sortDirection === 'asc' ? 'priority_low' : 'priority_high';
    return 'default';
  };

  const sortBy = getSortOption();
  const sortTasks = (tasks: Task[], sortOption: SortOption): Task[] => {
    const tasksCopy = [...tasks];
    
    switch (sortOption) {
      case 'due_date_asc':
        return tasksCopy.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1; // null dates go to end
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        });
      
      case 'due_date_desc':
        return tasksCopy.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1; // null dates go to end
          if (!b.due_date) return -1;
          return b.due_date.localeCompare(a.due_date);
        });
      
      case 'priority_high':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return tasksCopy.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      
      case 'priority_low':
        const priorityOrderLow = { high: 3, medium: 2, low: 1 };
        return tasksCopy.sort((a, b) => priorityOrderLow[a.priority] - priorityOrderLow[b.priority]);
      
      case 'default':
      default:
        return tasksCopy; // Return original order
    }
  };

  const sortedTasks = sortTasks(tasks, sortBy);

  const handleSortTypeChange = (newSortType: SortType) => {
    setSortType(newSortType);
    if (newSortType !== 'none') {
      setSortDirection('asc'); // Reset to ascending when changing sort type
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getDirectionLabel = () => {
    if (sortType === 'date') {
      return sortDirection === 'asc' ? 'Earliest First' : 'Latest First';
    }
    if (sortType === 'priority') {
      return sortDirection === 'asc' ? 'Low to High' : 'High to Low';
    }
    return '';
  };
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-500">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="relative">
              <select
                value={sortType}
                onChange={(e) => handleSortTypeChange(e.target.value as SortType)}
                className="text-xs border border-gray-300 rounded-md px-2 py-1 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="none">None</option>
                <option value="date">Date</option>
                <option value="priority">Priority</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {sortType !== 'none' && (
            <button
              onClick={toggleSortDirection}
              className="flex items-center gap-2 px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>{getDirectionLabel()}</span>
            </button>
          )}
          
          {sortType !== 'none' && (
            <button
              onClick={() => handleSortTypeChange('none')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      
      {/* Task Items */}
      <div className="space-y-3">
        {sortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onRefetch={onRefetch}
          />
        ))}
      </div>
    </div>
  );
}