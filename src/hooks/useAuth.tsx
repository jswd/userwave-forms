
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userDetails: {
    id: string;
    email: string;
    role: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
  signUp: (email: string, password: string, role: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<AuthContextType['userDetails']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load initial session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          await fetchUserDetails(session.user.id);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        setError('Failed to load user session.');
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          await fetchUserDetails(session.user.id);
        } else {
          setUserDetails(null);
        }

        if (event === 'SIGNED_IN') {
          // Log sign in
          if (session?.user) {
            await logLogin(session.user.id, 'signed_in');
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/');
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUserDetails({
          id: data.id,
          email: data.email,
          role: data.role,
          fullName: data.full_name,
          avatarUrl: data.avatar_url
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const logLogin = async (userId: string, action: string) => {
    try {
      await supabase.from('login_logs').insert({
        user_id: userId,
        action,
        user_agent: navigator.userAgent,
        // IP address would typically be captured server-side
      });
    } catch (error) {
      console.error('Error logging login:', error);
    }
  };

  const signUp = async (email: string, password: string, role: string, fullName?: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Create a user record in the users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            role: role,
            full_name: fullName || null,
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw new Error('Failed to create user profile. Please try again.');
        }

        toast({
          title: 'Account created',
          description: 'Please check your email to confirm your account.',
        });

        navigate('/');
      }
    } catch (error) {
      const e = error as AuthError;
      setError(e.message);
      toast({
        variant: 'destructive',
        title: 'Error creating account',
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Update last sign in
        await supabase
          .from('users')
          .update({ last_sign_in: new Date().toISOString() })
          .eq('id', data.user.id);

        // Log sign in
        await logLogin(data.user.id, 'signed_in');

        // Redirect based on role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userData?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }

        toast({
          title: 'Welcome back',
          description: 'You have successfully signed in.',
        });
      }
    } catch (error) {
      const e = error as AuthError;
      setError(e.message);
      toast({
        variant: 'destructive',
        title: 'Error signing in',
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const e = error as AuthError;
      setError(e.message);
      toast({
        variant: 'destructive',
        title: 'Error signing out',
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userDetails,
        signUp,
        signIn,
        signOut,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
