import { useState, useRef } from 'react';
import { Plus, ChevronDown, Calendar } from 'lucide-react';
import { CalendarPicker } from './CalendarPicker';

interface TaskInputProps {
  onAddTask: (title: string, description?: string, priority?: 'low' | 'medium' | 'high', dueDate?: string | null) => Promise<void>;
  placeholder?: string;
  onRefetch?: () => Promise<void>;
}

const priorityColors = {
  low: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

export function TaskInput({ onAddTask, placeholder = "Add a new task...", onRefetch = async () => {} }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      await onAddTask(
        title.trim(),
        description.trim() || undefined,
        priority,
        dueDate
      );
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(null);
      setShowDetails(false);
      inputRef.current?.focus();
      // Refetch tasks to reorder by due date
      await onRefetch();
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-12 border-none rounded-t-lg focus:outline-none"
            aria-label="Add new task"
            autoFocus
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Add task"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {showDetails && (
          <div className="px-4 pb-4 space-y-3 !text-sm border-t border-gray-200">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={2}
              aria-label="Task description"
            />

            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className={`pl-3 pr-8 py-2 text-xs font-light border rounded-full appearance-none cursor-pointer ${priorityColors[priority]}`}
                  aria-label="Task priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${
                  priority === 'low' ? 'text-cyan-800' :
                  priority === 'medium' ? 'text-orange-800' :
                  'text-red-800'
                }`} />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDatePicker(!showDatePicker);
                }}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors
                  ${dueDate 
                    ? 'bg-blue-50 border-blue-200 text-blue-800' 
                    : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Calendar className="w-4 h-4" />
                <span>{dueDate ? formatDisplayDate(dueDate) : 'Add due date'}</span>
              </button>

              {showDatePicker && (
                <CalendarPicker
                  value={dueDate}
                  onChange={(newDate) => {
                    setDueDate(newDate);
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>
          </div>
        )}

        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:text-blue-700 font-light"
            >
              {showDetails ? 'Hide details' : 'Add details'}
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {loading ? 'Adding...' : 'Add task'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}