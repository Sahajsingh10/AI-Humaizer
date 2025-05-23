import { create } from 'zustand';
import { supabase, File, uploadFile, deleteFile } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface FileState {
  files: File[];
  loading: boolean;
  error: string | null;
  fetchFiles: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  deleteFile: (id: string, path: string) => Promise<void>;
  removeFileFromUI: (id: string) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  loading: false,
  error: null,
  
  fetchFiles: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ files: data as File[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  uploadFile: async (file: File) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    // Prevent upload if credits are less than 25
    if (user.credits < 25) {
      set({ error: 'You are out of credits. Please buy more to upload files.' });
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const uploadResult = await uploadFile(file, user.id);
      
      const { error } = await supabase
        .from('files')
        .insert([{
          user_id: user.id,
          name: file.name,
          size: file.size,
          type: file.type,
          path: uploadResult.path
        }]);
      
      if (error) throw error;
      
      // Decrement credits by 25 in the profiles table
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: user.credits - 25 })
        .eq('id', user.id);
      if (creditError) throw creditError;
      
      // Refetch user profile to update credits in local state
      await useAuthStore.getState().fetchUserProfile();
      
      await get().fetchFiles();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteFile: async (id: string, path: string) => {
    set({ loading: true, error: null });
    try {
      await deleteFile(path);
      
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        files: state.files.filter(file => file.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  removeFileFromUI: (id: string) => {
    set(state => ({
      files: state.files.filter(file => file.id !== id)
    }));
  }
}));