import { useState, useEffect } from 'react';
import { supabase, Task } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

// Global cache to share tasks between hook instances
let globalTasks: Task[] = [];
let globalLoading = false;
let globalListeners: Set<() => void> = new Set();

const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

export function useTasks() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(globalTasks);
  const [loading, setLoading] = useState(globalLoading && globalTasks.length === 0);

  useEffect(() => {
    const listener = () => {
      setTasks([...globalTasks]);
      setLoading(globalLoading && globalTasks.length === 0);
    };
    
    globalListeners.add(listener);
    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    
    // Only show loading if we don't have any cached data
    const shouldShowLoading = globalTasks.length === 0;
    if (shouldShowLoading) {
      globalLoading = true;
      setLoading(true);
      notifyListeners();
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true, nullsLast: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      globalTasks = data || [];
      setTasks([...globalTasks]);
    }
    
    if (shouldShowLoading) {
      globalLoading = false;
      setLoading(false);
      notifyListeners();
    }
  };

  const addTask = async (title: string, description?: string, priority?: 'low' | 'medium' | 'high', dueDate?: string | null) => {
    if (!user || !title.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'medium',
        due_date: dueDate || null,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    } else {
      globalTasks = [data, ...globalTasks];
      setTasks([...globalTasks]);
      notifyListeners();
      showToast(`${data.title} added successfully`, 'success');
      return data;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    } else {
      globalTasks = globalTasks.map(task => task.id === id ? data : task);
      setTasks([...globalTasks]);
      notifyListeners();
      return data;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    const taskToDelete = tasks.find(task => task.id === id);
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    } else {
      globalTasks = globalTasks.filter(task => task.id !== id);
      setTasks([...globalTasks]);
      notifyListeners();
      showToast(`${taskToDelete?.title || 'Task'} deleted`, 'success');
    }
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const result = await updateTask(id, { completed: !task.completed });
    
    if (result) {
      const action = !task.completed ? 'completed!' : 'marked as incomplete!';
      showToast(`${task.title} ${action}`, 'success');
    }
    
    return result;
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    refetch: fetchTasks,
  };
}