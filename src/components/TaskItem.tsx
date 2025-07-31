import { useState, useEffect } from 'react';
import { Check, Edit2, Trash2, X, ChevronDown, Calendar } from 'lucide-react';
import { Task } from '../lib/supabase';
import { CalendarPicker } from '../components/CalendarPicker';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onRefetch?: () => Promise<void>;
}

const priorityColors = {
  low: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

export function TaskItem({ task, onToggleComplete, onUpdateTask, onDeleteTask, onRefetch }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [loading, setLoading] = useState(false);
  const [editDueDate, setEditDueDate] = useState<string | null>(task.due_date);
  const [displayPriority, setDisplayPriority] = useState<'low' | 'medium' | 'high'>(task.priority);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setDisplayPriority(task.priority);
    setEditDueDate(task.due_date);
  }, [task.priority]);

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    
    setLoading(true);
    try {
      await onUpdateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        due_date: editDueDate,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.due_date);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      await onToggleComplete(task.id);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDeleteTask(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setLoading(false);
    }
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    setDisplayPriority(priority);
    onUpdateTask(task.id, { priority })
      .catch((error) => {
        console.error('Failed to update priority:', error);
        setDisplayPriority(task.priority);
      });
  };

  const handlePriorityChangeWithBlur = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const priority = e.target.value as 'low' | 'medium' | 'high';
    handlePriorityChange(priority);
    e.target.blur(); // Remove focus after selection
  };

  const handleDueDateChange = (newDueDate: string | null) => {
    // Only save when explicitly called (on blur or enter)
    if (newDueDate && newDueDate.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(newDueDate)) {
      onUpdateTask(task.id, { due_date: newDueDate })
        .catch((error) => {
          console.error('Failed to update due date:', error);
        });
    }
  };

  const handleCalendarChange = (newDate: string | null) => {
    setEditDueDate(newDate);
    onUpdateTask(task.id, { due_date: newDate })
      .then(() => {
        // Refetch tasks to reorder them by due date
        if (onRefetch) {
          onRefetch();
        }
      })
      .catch((error) => {
        console.error('Failed to update due date:', error);
        setEditDueDate(task.due_date); // Revert on error
      });
  };

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = () => {
    if (!task.due_date || task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.due_date < today;
  };

  const overdue = isOverdue();

  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${
      task.completed ? 'opacity-75 border-gray-200' : 
      overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-500'
          } disabled:opacity-50`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && <Check className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                aria-label="Edit task title"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Description (optional)"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                rows={2}
                aria-label="Edit task description"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDatePicker(!showDatePicker);
                  }}
                  className={`
                    flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors
                    ${editDueDate 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{editDueDate ? formatDisplayDate(editDueDate) : 'No due date'}</span>
                </button>
                
                {showDatePicker && (
                  <CalendarPicker
                    value={editDueDate}
                    onChange={(newDate) => {
                      setEditDueDate(newDate);
                      setShowDatePicker(false);
                    }}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!editTitle.trim() || loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`mt-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <div className="relative flex-shrink-0">
                  <select
                    value={displayPriority}
                    onChange={handlePriorityChangeWithBlur}
                    disabled={loading}
                    className={`pl-2 pr-6 py-1 text-[10px] font-light border rounded-full appearance-none cursor-pointer ${priorityColors[displayPriority]} disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label="Task priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none ${
                    displayPriority === 'low' ? 'text-cyan-800' :
                    displayPriority === 'medium' ? 'text-orange-800' :
                    'text-red-800'
                  }`} />
                </div>
                
                <div className="relative group flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDatePicker(!showDatePicker);
                    }}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      overdue 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Calendar className={`w-3 h-3 ${overdue ? 'text-red-600' : ''}`} />
                    {task.due_date && (
                      <span className={overdue ? 'font-medium' : ''}>
                        {formatDisplayDate(task.due_date)}
                        {overdue && <span className="ml-1 text-xs">(overdue)</span>}
                      </span>
                    )}
                  </button>
                  
                  {showDatePicker && (
                    <CalendarPicker
                      value={editDueDate}
                      onChange={handleCalendarChange}
                      onClose={() => setShowDatePicker(false)}
                    />
                  )}
                  {!task.due_date && !showDatePicker && !editDueDate && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Add due date
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
              aria-label="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}