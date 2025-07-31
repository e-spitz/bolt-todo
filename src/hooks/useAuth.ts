// import { supabase } from '../lib/supabase';
// import { useAuthContext } from '../contexts/AuthContext';

// export function useAuth() {
//   const { user, loading } = useAuthContext();

//   const signIn = async (email: string, password: string) => {
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     return { error };
//   };

//   const signUp = async (email: string, password: string) => {
//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         emailRedirectTo: undefined, // Disable email confirmation
//       },
//     });
//     return { error };
//   };

//   const signOut = async () => {
//     console.log('SignOut function called');
//     try {
//       // Try global logout first, but if it fails due to session issues, fall back to local
//       const { error } = await supabase.auth.signOut({ scope: 'global' });
      
//       if (error && (error.message?.includes('session_not_found') || error.message?.includes('Session from session_id claim in JWT does not exist'))) {
//         console.log('Server session not found, clearing local session only');
//         // Clear local session when server session doesn't exist
//         await supabase.auth.signOut({ scope: 'local' });
//         return { error: null };
//       }
      
//       if (error) {
//         console.log('SignOut error:', error);
//         return { error };
//       }
      
//       return { error: null };
//     } catch (err) {
//       console.log('SignOut catch error:', err);
//       return { error: err };
//     }
//   };

//   return {
//     user,
//     loading,
//     signIn,
//     signUp,
//     signOut,
//   };
// }

import { useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

type AuthResult = { error: null } | { error: { message: string } };

export function useAuth() {
  const { user, loading } = useAuthContext();
  const signingOut = useRef(false);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: { message: error.message } } : { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined }, // no email confirm in this app
    });
    return error ? { error: { message: error.message } } : { error: null };
  }, []);

  const signOut = useCallback(async (): Promise<AuthResult> => {
    if (signingOut.current) return { error: null }; // prevent double calls
    signingOut.current = true;
    // If user is already null and loading is false, skip the signOut call
    if (!user && !loading) {
      return { error: null };
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    console.log('session on this origin:', session);
    
    try {
      // Local only: clears this browser's session and cookies.
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      // Treat “session not found” as benign; we’re effectively signed out.
      if (error && !/session_not_found/i.test(error.message)) {
        console.warn('Sign out error:', error);
        return { error: { message: error.message } };
      }
      return { error: null };
    } finally {
      signingOut.current = false;
    }
  }, []);

  return { user, loading, signIn, signUp, signOut };
}
