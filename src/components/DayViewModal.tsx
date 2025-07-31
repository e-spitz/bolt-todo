import { useState } from 'react';
import { X } from 'lucide-react';
import { Task } from '../lib/supabase';
import { TaskItem } from './TaskItem';

interface DayViewModalProps {
  date: string;
  tasks: Task[];
  onClose: () => void;
  onToggleComplete: (id: string) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onRefetch?: () => Promise<void>;
}

export function DayViewModal({ 
  date, 
  tasks, 
  onClose, 
  onToggleComplete, 
  onUpdateTask, 
  onDeleteTask,
  onRefetch
}: DayViewModalProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const overdueCount = tasks.filter(task => {
    if (!task.due_date || task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.due_date < today;
  }).length;

  const isOverdueDate = () => {
    const today = new Date().toISOString().split('T')[0];
    return date < today && overdueCount > 0;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col ${
        isOverdueDate() ? 'border-2 border-red-300' : ''
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isOverdueDate() ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {formatDate(date)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} scheduled
                {overdueCount > 0 && (
                  <span className="text-red-600 ml-1">
                    • {overdueCount} overdue
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
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
          )}
        </div>
      </div>
    </div>
  );
}