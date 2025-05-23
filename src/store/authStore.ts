import { create } from 'zustand';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean; // Added initialized state
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false, // Start with initialized as false
  error: null,
  
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ error: 'Incorrect email or password', loading: false, initialized: true });
        return;
      }
      if (data.user) {
        await get().fetchUserProfile();
      }
    } catch (error) {
      set({ error: 'An error occurred while signing in. Please try again.' });
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  
  signup: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            credits: 100,
            tier: 'free'
          }
        }
      });
      
      if (error) throw error;
      
      // Note: User will need to confirm email before they can login
      if (data.user && !data.user.email_confirmed_at) {
        set({ 
          error: null,
          user: null,
          initialized: true
        });
        // You might want to show a message about email confirmation
        console.log('Please check your email to confirm your account');
      } else if (data.user) {
        await get().fetchUserProfile();
      }
    } catch (error) {
      console.error('Signup error:', error);
      set({ error: (error as Error).message, initialized: true });
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  
  logout: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, initialized: true });
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: (error as Error).message, initialized: true });
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  
  fetchUserProfile: async () => {
    set({ loading: true }); // Set loading when starting to fetch
    try {
      // Use getSession for more reliable session restoration
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        set({ user: null, loading: false, initialized: true });
        return;
      }
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        set({ user: null, loading: false, initialized: true });
        return;
      }
      // First try to get existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: authData.user.email || '',
            credits: 100,
            tier: 'free'
          }])
          .select()
          .single();
        if (createError) {
          set({ error: 'Failed to create user profile', user: null, loading: false, initialized: true });
          return;
        }
        set({ 
          user: {
            id: authData.user.id,
            email: authData.user.email || '',
            name: newProfile?.name,
            credits: newProfile?.credits !== undefined && newProfile?.credits !== null ? newProfile.credits : 100,
            tier: newProfile?.tier || 'free',
            createdAt: newProfile?.created_at || new Date().toISOString()
          },
          loading: false,
          initialized: true
        });
      } else if (error) {
        set({ error: error.message, user: null, loading: false, initialized: true });
      } else {
        set({ 
          user: {
            id: authData.user.id,
            email: authData.user.email || '',
            name: profile?.name,
            credits: profile?.credits !== undefined && profile?.credits !== null ? profile.credits : 100,
            tier: profile?.tier || 'free',
            createdAt: profile?.created_at || new Date().toISOString()
          },
          loading: false,
          initialized: true
        });
      }
    } catch (error) {
      set({ error: 'Failed to fetch user profile', user: null, loading: false, initialized: true });
    }
  },
}));