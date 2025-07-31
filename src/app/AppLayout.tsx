import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { ContentArea } from '../components/ContentArea';

const STORAGE_KEY = 'sidebar-collapsed';

export function AppLayout() {
  const location = useLocation();

  // Persist collapsed state across reloads
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
    } catch {
      // no-op for private browsing / storage errors
    }
  }, [collapsed]);

  // ---- Title resolver for the TopBar ----
  const getTitle = (pathname: string) => {
    if (pathname.startsWith('/app/todo')) return 'To‑Do';
    if (pathname.startsWith('/app/completed')) return 'Completed';
    if (pathname.startsWith('/app/calendar')) return 'Calendar';
    if (pathname.startsWith('/login')) return 'Sign In';
    return 'To‑Do App';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex-1 flex flex-col">
        <TopBar title={getTitle(location.pathname)} />
        <ContentArea />
      </div>
    </div>
  );
}
