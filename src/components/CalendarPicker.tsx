import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  /** ISO 'YYYY-MM-DD' or null */
  value: string | null;
  /** Called with the selected ISO date (or null for Clear) */
  onChange: (date: string | null) => void;
  /** Close the picker (parent controls visibility) */
  onClose: () => void;
}

function iso(year: number, monthZeroBased: number, day: number) {
  const y = String(year);
  const m = String(monthZeroBased + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarPicker({ value, onChange, onClose }: CalendarPickerProps) {
  // Start on selected date's month, or today.
  const [currentDate, setCurrentDate] = useState<Date>(() =>
    value ? new Date(`${value}T00:00:00`) : new Date()
  );

  // Keep the visible month in sync if value changes while open.
  useEffect(() => {
    if (value) setCurrentDate(new Date(`${value}T00:00:00`));
  }, [value]);

  // Close on ESC or clicking the backdrop.
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function onMouse(e: MouseEvent) {
      if (!panelRef.current) return;
      const t = e.target as Node;
      if (!panelRef.current.contains(t)) onClose();
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onMouse);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onMouse);
    };
  }, [onClose]);

  // Derived values
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = useMemo(() => new Date(year, month, 1), [year, month]);
  const lastDay = useMemo(() => new Date(year, month + 1, 0), [year, month]);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Build the grid cells (null = placeholder cell before the 1st)
  const calendarDays = useMemo<(number | null)[]>(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [startingDayOfWeek, daysInMonth]);

  // Navigation (avoid carry‑over by setting date to 1 first)
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(1);
      d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
      return d;
    });
  }, []);

  const setYear = useCallback((y: number) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(1);
      d.setFullYear(y);
      return d;
    });
  }, []);

  // Selection helpers
  const selectDate = (day: number) => {
    onChange(iso(year, month, day));
    onClose();
  };

  const goToToday = () => {
    const t = new Date();
    onChange(iso(t.getFullYear(), t.getMonth(), t.getDate()));
    onClose();
  };

  const clearDate = () => {
    onChange(null);
    onClose();
  };

  // Highlighting for selected/today
  const selectedDay =
    value && value.startsWith(iso(year, month, 1).slice(0, 7))
      ? parseInt(value.split('-')[2], 10)
      : null;

  const today = new Date();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();
  const todayDay = isCurrentMonth ? today.getDate() : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a date"
    >
      <div
        ref={panelRef}
        className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-[320px] max-w-[90vw]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {MONTHS[month]}
            </span>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none cursor-pointer hover:bg-gray-50 rounded px-1"
              aria-label="Select year"
            >
              {Array.from({ length: 21 }, (_, i) => {
                const y = new Date().getFullYear() - 10 + i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DOW.map((d) => (
            <div
              key={d}
              className="p-1 text-center text-xs font-medium text-gray-500"
              aria-hidden
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {calendarDays.map((day, idx) => {
            const key = `${year}-${month}-${idx}`; // unique per cell for this month view

            if (day === null) {
              return <div key={key} className="p-1" aria-hidden />;
            }

            const isSelected = day === selectedDay;
            const isToday = day === todayDay;

            return (
              <button
                key={key}
                onClick={() => selectDate(day)}
                className={[
                  'w-8 h-8 p-1 text-sm rounded flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : isToday
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'text-gray-900 hover:bg-gray-100',
                ].join(' ')}
                aria-current={isToday ? 'date' : undefined}
                aria-pressed={isSelected || undefined}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-2">
          <button
            type="button"
            onClick={clearDate}
            className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}