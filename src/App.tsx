import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppRouter } from './app/router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MissingEnvBanner } from './components/MissingEnvBanner';

// Check for missing environment variables in development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

function App() {
  // Show banner in development if env vars are missing
  if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env.DEV) {
    return <MissingEnvBanner />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;