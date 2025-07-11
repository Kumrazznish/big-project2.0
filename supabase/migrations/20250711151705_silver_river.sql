/*
  # Create roadmaps and detailed courses tables

  1. New Tables
    - `roadmaps`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth.users)
      - `subject` (text)
      - `difficulty` (text)
      - `roadmap_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `detailed_courses`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth.users)
      - `roadmap_id` (uuid, references roadmaps)
      - `course_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  subject text NOT NULL,
  difficulty text NOT NULL,
  roadmap_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create detailed_courses table
CREATE TABLE IF NOT EXISTS detailed_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  roadmap_id uuid NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  course_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE detailed_courses ENABLE ROW LEVEL SECURITY;

-- Create policies for roadmaps
CREATE POLICY "Users can read own roadmaps"
  ON roadmaps
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own roadmaps"
  ON roadmaps
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own roadmaps"
  ON roadmaps
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own roadmaps"
  ON roadmaps
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Create policies for detailed_courses
CREATE POLICY "Users can read own detailed courses"
  ON detailed_courses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own detailed courses"
  ON detailed_courses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own detailed courses"
  ON detailed_courses
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own detailed courses"
  ON detailed_courses
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS roadmaps_user_id_idx ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS roadmaps_created_at_idx ON roadmaps(created_at);
CREATE INDEX IF NOT EXISTS detailed_courses_user_id_idx ON detailed_courses(user_id);
CREATE INDEX IF NOT EXISTS detailed_courses_roadmap_id_idx ON detailed_courses(roadmap_id);