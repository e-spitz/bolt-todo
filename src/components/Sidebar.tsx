import { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

/** Shared link classes */
const baseItem =
  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors';
const active = 'bg-blue-100 text-blue-800 border border-blue-200';
const inactive = 'text-gray-700 hover:bg-gray-100';

/** Portal-based tooltip that renders at document root to avoid z-index issues */
function PortalTooltip({ label, targetRect, show }: { 
  label: string; 
  targetRect: DOMRect | null; 
  show: boolean; 
}) {
  if (!show || !targetRect) return null;

  const tooltipStyle = {
    position: 'fixed' as const,
    left: targetRect.right + 12, // 12px gap from the sidebar
    top: targetRect.top + targetRect.height / 2,
    transform: 'translateY(-50%)',
    zIndex: 99999,
  };

  return (
    createPortal(
      <div
        role="tooltip"
        style={tooltipStyle}
        className="
          whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-3 py-1
          shadow-lg pointer-events-none animate-in fade-in-0 duration-150
        "
      >
        {label}
        <span
          aria-hidden
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-gray-900 rounded-[2px]"
        />
      </div>,
      document.body
    )
  );
}

/** Hook to manage tooltip state and positioning */
function useTooltip() {
  const [tooltip, setTooltip] = useState<{
    label: string;
    targetRect: DOMRect | null;
    show: boolean;
  }>({
    label: '',
    targetRect: null,
    show: false,
  });

  const showTooltip = (label: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setTooltip({ label, targetRect: rect, show: true });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  return { tooltip, showTooltip, hideTooltip };
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const { tooltip, showTooltip, hideTooltip } = useTooltip();
  const { tasks } = useTasks();

  // Calculate task counts
  const incompleteTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.filter(task => task.completed).length;

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      navigate('/login', { replace: true });
      setSigningOut(false);
    }
  }

  return (
    <aside
      className={[
        'sticky top-0 h-screen',
        'bg-white border-r border-gray-200 flex flex-col transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-64',
      ].join(' ')}
      aria-label="Primary"
      aria-expanded={!collapsed}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className={['text-xl font-bold text-gray-900', collapsed ? 'sr-only' : 'block'].join(' ')}>
          To-Do App
        </h1>
        <button
          onClick={onToggle}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 p-1 text-gray-600 hover:bg-gray-50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/app/todo"
              className={({ isActive }) => [baseItem, isActive ? active : inactive].join(' ')}
              onMouseEnter={(e) => collapsed && showTooltip('To-Do', e.currentTarget)}
              onMouseLeave={() => collapsed && hideTooltip()}
              onFocus={(e) => collapsed && showTooltip('To-Do', e.currentTarget)}
              onBlur={() => collapsed && hideTooltip()}
            >
              <CheckSquare className="w-5 h-5 shrink-0" aria-hidden />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>To-Do</span>
                  {incompleteTasks > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {incompleteTasks}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/app/completed"
              className={({ isActive }) => [baseItem, isActive ? active : inactive].join(' ')}
              onMouseEnter={(e) => collapsed && showTooltip('Completed', e.currentTarget)}
              onMouseLeave={() => collapsed && hideTooltip()}
              onFocus={(e) => collapsed && showTooltip('Completed', e.currentTarget)}
              onBlur={() => collapsed && hideTooltip()}
            >
              <CheckCircle className="w-5 h-5 shrink-0" aria-hidden />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>Completed</span>
                  {completedTasks > 0 && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      {completedTasks}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/app/calendar"
              className={({ isActive }) => [baseItem, isActive ? active : inactive].join(' ')}
              onMouseEnter={(e) => collapsed && showTooltip('Calendar', e.currentTarget)}
              onMouseLeave={() => collapsed && hideTooltip()}
              onFocus={(e) => collapsed && showTooltip('Calendar', e.currentTarget)}
              onBlur={() => collapsed && hideTooltip()}
            >
              <CalendarIcon className="w-5 h-5 shrink-0" aria-hidden />
              {!collapsed && <span>Calendar</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Footer pinned to bottom; nav above scrolls independently */}
      <div className="mt-auto w-full border-t border-gray-200 bg-white">
        <div className="p-3">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            aria-busy={signingOut}
            onMouseEnter={(e) => collapsed && showTooltip('Sign Out', e.currentTarget)}
            onMouseLeave={() => collapsed && hideTooltip()}
            onFocus={(e) => collapsed && showTooltip('Sign Out', e.currentTarget)}
            onBlur={() => collapsed && hideTooltip()}
            className={[
              'w-full inline-flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'text-gray-700 hover:bg-gray-100 disabled:opacity-50',
            ].join(' ')}
          >
            <LogOut className="w-5 h-5 shrink-0" aria-hidden />
            {!collapsed && <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>}
            {collapsed && <span className="sr-only">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Portal-based tooltip */}
      <PortalTooltip
        label={tooltip.label}
        targetRect={tooltip.targetRect}
        show={tooltip.show}
      />
    </aside>
  );
}
