import { create } from 'zustand';
import { supabase, Project } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (title: string, originalText: string, humanizedText: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  
  fetchProjects: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ projects: data as Project[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  createProject: async (title: string, originalText: string, humanizedText: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    if (user.credits < 1) {
      set({ error: 'Insufficient credits' });
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      if (!profile || profile.credits < 1) {
        throw new Error('Insufficient credits');
      }

      // Start a transaction using RPC
      const { data, error } = await supabase.rpc('create_project_with_credits', {
        p_title: title,
        p_user_id: user.id,
        p_original_text: originalText,
        p_humanized_text: humanizedText
      });
      
      if (error) throw error;
      
      // Update local state
      await useAuthStore.getState().fetchUserProfile();
      await get().fetchProjects();
      
      set({ currentProject: data as Project });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteProject: async (id: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Add user_id check for extra security
      
      if (error) throw error;
      
      set(state => ({
        projects: state.projects.filter(project => project.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));