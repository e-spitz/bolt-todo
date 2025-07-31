import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { DayViewModal } from '../components/DayViewModal';
import type { Task } from '../lib/supabase';

export function CalendarPage() {
  const { tasks, loading, updateTask, deleteTask, toggleComplete, refetch } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = useMemo(() => new Date(year, month, 1), [year, month]);
  const lastDay  = useMemo(() => new Date(year, month + 1, 0), [year, month]);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // Sunday=0

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  /** Build the cells for the visible month. null = placeholder before day 1 */
  const calendarDays = useMemo<(number | null)[]>(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [startingDayOfWeek, daysInMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(1); // avoid 31 -> shorter month carryover
      d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
      return d;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const formatDateString = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getTasksForDate = (dateStr: string): Task[] =>
    tasks.filter(t => t.due_date === dateStr);

  const isToday = (day: number) => {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const hasOverdueTasks = (day: number) => {
    const dateStr = formatDateString(day);
    const dayTasks = getTasksForDate(dateStr);
    const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return dateStr < todayISO && dayTasks.some(t => !t.completed);
  };

  const getTaskCounts = (day: number) => {
    const dateStr = formatDateString(day);
    const dayTasks = getTasksForDate(dateStr);
    return {
      total: dayTasks.length,
      completed: dayTasks.filter(t => t.completed).length,
      incomplete: dayTasks.filter(t => !t.completed).length,
    };
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDateString(day);
    if (getTasksForDate(dateStr).length > 0) {
      setSelectedDate(dateStr);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            <span className="ml-2 text-gray-500">Loading calendar...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                value={year}
                onChange={(e) =>
                  setCurrentDate(prev => {
                    const d = new Date(prev);
                    d.setDate(1);
                    d.setFullYear(parseInt(e.target.value, 10));
                    return d;
                  })
                }
                className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
                aria-label="Select year"
              >
                {Array.from({ length: 21 }, (_, i) => {
                  const y = new Date().getFullYear() - 10 + i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold text-gray-900 min-w-[120px] text-center">
                {monthNames[month]}
              </h2>

              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Today
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((d) => (
              <div key={d} className="p-3 text-center text-sm font-medium text-gray-500">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const cellKey = `${year}-${month}-${idx}`; // <-- unique per visible cell

              if (day === null) {
                return <div key={cellKey} className="h-16" aria-hidden />;
              }

              const taskCounts = getTaskCounts(day);
              const todayClass = isToday(day);
              const hasOverdue = hasOverdueTasks(day);
              const hasTasks = taskCounts.total > 0;

              return (
                <button
                  key={cellKey}
                  onClick={() => handleDayClick(day)}
                  className={[
                    'h-16 p-2 border rounded-lg transition-colors relative',
                    todayClass ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200',
                    hasOverdue ? 'border-red-300 bg-red-50' : '',
                    hasTasks ? 'cursor-pointer' : 'cursor-default',
                  ].join(' ')}
                  aria-label={`${monthNames[month]} ${day}, ${year}`}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={[
                        'text-sm font-medium',
                        todayClass ? 'text-blue-900' : hasOverdue ? 'text-red-900' : 'text-gray-900',
                      ].join(' ')}
                    >
                      {day}
                    </span>

                    {hasTasks && (
                      <div className="flex-1 flex items-end justify-center">
                        <div className="flex gap-1">
                          {taskCounts.incomplete > 0 && (
                            <div className={['w-2 h-2 rounded-full', hasOverdue ? 'bg-red-500' : 'bg-blue-500'].join(' ')} />
                          )}
                          {taskCounts.completed > 0 && (
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day View Modal */}
      {selectedDate && (
        <DayViewModal
          date={selectedDate}
          tasks={getTasksForDate(selectedDate)}
          onClose={() => setSelectedDate(null)}
          onToggleComplete={toggleComplete}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onRefetch={refetch}
        />
      )}
    </div>
  );
}