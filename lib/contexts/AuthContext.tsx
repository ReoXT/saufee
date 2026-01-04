import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { supabase } from '../supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let sessionLoaded = false;

    // Get initial session with timeout
    const sessionPromise = supabase.auth.getSession()
      .then(({ data: { session } }: any) => {
        if (isMounted) {
          sessionLoaded = true;
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          console.log('Session loaded:', session?.user?.email || 'no session');
        }
      })
      .catch((err) => {
        console.warn('Error getting session:', err);
        if (isMounted && !sessionLoaded) {
          sessionLoaded = true;
          setLoading(false);
        }
      });

    // Set fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && !sessionLoaded) {
        console.warn('Session loading timeout, proceeding without session');
        sessionLoaded = true;
        setLoading(false);
      }
    }, 3000);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Return user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: new Error('Invalid email or password') };
        }
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('An unexpected error occurred'),
      };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        // Return user-friendly error messages
        if (error.message.includes('already registered')) {
          return { error: new Error('Email already exists') };
        }
        return { error: new Error(error.message) };
      }

      if (!data.user) {
        return { error: new Error('Failed to create account') };
      }

      // Note: users_metadata will be created automatically by the trigger
      // defined in 03_triggers.sql (handle_new_user function)

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('An unexpected error occurred'),
      };
    }
  };

  const signOut = async () => {
    try {
      // Clear session state immediately
      setUser(null);
      setSession(null);

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Force navigation to login screen
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, navigate to login
      router.replace('/(auth)/login');
    }
  };

  const refreshSession = async () => {
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
