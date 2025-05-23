import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  credits: number;
  tier: 'free' | 'basic' | 'premium';
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  originalText: string;
  humanizedText: string;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  id: string;
  userId: string;
  name: string;
  size: number;
  type: string;
  path: string;
  createdAt: string;
}

// File upload function
export const uploadFile = async (file: File, userId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    return { path: filePath, ...data };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file. Please try again.');
  }
};

// File delete function
export const deleteFile = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from('files')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file. Please try again.');
  }
};

// Get file URL
export const getFileUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('files')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Initialize storage bucket (optional - should be done via SQL)
export const initializeStorage = async () => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const filesBucket = buckets?.find(bucket => bucket.name === 'files');
    
    if (!filesBucket) {
      console.log('Files bucket does not exist. Please create it manually in Supabase dashboard.');
      return false;
    }
    
    console.log('Storage initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
};

// Call this when the app starts
initializeStorage();