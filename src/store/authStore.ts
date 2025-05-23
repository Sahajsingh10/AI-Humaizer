import { create } from 'zustand';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // 1. Check if user exists
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !userProfile) {
        set({ error: 'Account not found. Please sign up.', loading: false });
        return;
      }

      // 2. Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) {
        set({ error: 'Incorrect password.', loading: false });
        return;
      }

      if (data.user) {
        await get().fetchUserProfile();
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ error: 'An error occurred while signing in. Please try again.' });
    } finally {
      set({ loading: false });
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
          user: null 
        });
        // You might want to show a message about email confirmation
        console.log('Please check your email to confirm your account');
      } else if (data.user) {
        await get().fetchUserProfile();
      }
    } catch (error) {
      console.error('Signup error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  logout: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchUserProfile: async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        set({ user: null });
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
          console.error('Error creating profile:', createError);
          set({ error: 'Failed to create user profile', user: null });
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
          } 
        });
      } else if (error) {
        console.error('Error fetching profile:', error);
        set({ error: error.message, user: null });
      } else {
        set({ 
          user: {
            id: authData.user.id,
            email: authData.user.email || '',
            name: profile?.name,
            credits: profile?.credits !== undefined && profile?.credits !== null ? profile.credits : 100,
            tier: profile?.tier || 'free',
            createdAt: profile?.created_at || new Date().toISOString()
          } 
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      set({ error: 'Failed to fetch user profile', user: null });
    }
  },
}));