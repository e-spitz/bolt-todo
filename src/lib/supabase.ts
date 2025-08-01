import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add these lines for debugging
console.log('Debugging Supabase URL:', supabaseUrl);
console.log('Debugging Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getUserId = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};