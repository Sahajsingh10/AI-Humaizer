/*
  # Initial schema setup for AI Humanizer

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users id
      - `email` (text) - user's email
      - `name` (text, optional) - user's display name
      - `credits` (integer) - available humanization credits
      - `tier` (text) - subscription tier (free, basic, premium)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references profiles.id
      - `title` (text) - project title
      - `original_text` (text) - input text
      - `humanized_text` (text) - humanized output
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
      - Read their own projects
      - Create new projects
      - Delete their own projects
    
  3. Functions
    - Added create_project_with_credits function to handle atomic project creation and credit deduction
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  name text,
  credits integer NOT NULL DEFAULT 100,
  tier text NOT NULL DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  original_text text NOT NULL,
  humanized_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for projects
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, tier)
  VALUES (new.id, new.email, 100, 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle project creation with credits
CREATE OR REPLACE FUNCTION public.create_project_with_credits(
  p_title TEXT,
  p_user_id UUID,
  p_original_text TEXT,
  p_humanized_text TEXT
) RETURNS projects AS $$
DECLARE
  v_project projects;
BEGIN
  -- Check if user has enough credits
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id 
    AND credits >= 1
  ) THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct credits
  UPDATE profiles 
  SET credits = credits - 1,
      updated_at = now()
  WHERE id = p_user_id;

  -- Create project
  INSERT INTO projects (
    title,
    user_id,
    original_text,
    humanized_text
  ) VALUES (
    p_title,
    p_user_id,
    p_original_text,
    p_humanized_text
  )
  RETURNING * INTO v_project;

  RETURN v_project;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;