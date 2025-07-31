import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '../features/auth/AuthGuard';
import { AppLayout } from './AppLayout';
import { Login } from '../pages/Login';
import { TodoPage } from '../pages/TodoPage';
import { CompletedPage } from '../pages/CompletedPage';
import { CalendarPage } from '../pages/CalendarPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={
        <AuthGuard>
          <AppLayout />
        </AuthGuard>
      }>
        <Route index element={<Navigate to="todo" replace />} />
        <Route path="todo" element={<TodoPage />} />
        <Route path="completed" element={<CompletedPage />} />
        <Route path="calendar" element={<CalendarPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/app/todo" replace />} />
      <Route path="*" element={<Navigate to="/app/todo" replace />} />
    </Routes>
  );
}