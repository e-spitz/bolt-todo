import { Outlet } from 'react-router-dom';

export function ContentArea() {
  return (
    <main className="flex-1 p-6">
      <Outlet />
    </main>
  );
}