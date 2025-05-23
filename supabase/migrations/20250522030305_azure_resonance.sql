/*
  # Add files table and storage configuration

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `size` (integer)
      - `type` (text)
      - `path` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `files` table
    - Add policies for authenticated users to:
      - Read their own files
      - Upload files
      - Delete their own files
*/

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  size integer NOT NULL,
  type text NOT NULL,
  path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('files', 'files', false)
  ON CONFLICT (id) DO NOTHING;

  -- Enable RLS for storage
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Create storage policies
  CREATE POLICY "Users can read own files in storage"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

  CREATE POLICY "Users can upload files to storage"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

  CREATE POLICY "Users can delete own files from storage"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);
END $$;