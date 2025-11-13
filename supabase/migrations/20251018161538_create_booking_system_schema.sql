/*
  # Classroom & Lab Booking System Schema

  ## Overview
  This migration creates a comprehensive booking system for classrooms and labs with conflict prevention,
  user management, and real-time availability tracking.

  ## New Tables

  ### 1. `profiles`
  User profiles extending Supabase auth
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - Either 'faculty' or 'student'
  - `department` (text) - User's department
  - `phone` (text, optional) - Contact number
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `rooms`
  Classrooms and lab spaces available for booking
  - `id` (uuid, primary key) - Unique room identifier
  - `name` (text) - Room name/number
  - `type` (text) - Either 'classroom' or 'lab'
  - `capacity` (integer) - Maximum occupancy
  - `building` (text) - Building location
  - `floor` (text) - Floor number/name
  - `equipment` (text array) - Available equipment (projector, computers, etc.)
  - `description` (text, optional) - Additional details
  - `is_active` (boolean) - Whether room is available for booking
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `bookings`
  Room/lab reservations with conflict prevention
  - `id` (uuid, primary key) - Unique booking identifier
  - `room_id` (uuid, foreign key) - References rooms table
  - `user_id` (uuid, foreign key) - References profiles table
  - `title` (text) - Booking title/purpose
  - `description` (text, optional) - Additional details
  - `start_time` (timestamptz) - Booking start time
  - `end_time` (timestamptz) - Booking end time
  - `status` (text) - 'pending', 'confirmed', or 'cancelled'
  - `attendee_count` (integer) - Expected number of attendees
  - `created_at` (timestamptz) - Booking creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `booking_conflicts`
  Log of detected conflicts and resolutions
  - `id` (uuid, primary key) - Unique conflict identifier
  - `original_booking_id` (uuid, foreign key) - The conflicting booking request
  - `conflicting_booking_id` (uuid, foreign key) - The existing booking causing conflict
  - `detected_at` (timestamptz) - When conflict was detected
  - `resolved` (boolean) - Whether conflict was resolved
  - `resolution_notes` (text, optional) - How it was resolved

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### profiles table
  - Users can view all profiles
  - Users can only update their own profile
  - New profiles created automatically via trigger

  #### rooms table
  - Everyone (authenticated) can view active rooms
  - Only faculty can create/update rooms

  #### bookings table
  - Users can view all bookings (for conflict checking and calendar views)
  - Users can create their own bookings
  - Users can only update/cancel their own bookings

  #### booking_conflicts table
  - Users can view conflicts related to their bookings
  - System automatically creates conflict records

  ## Indexes
  - Fast lookup of bookings by room and time range
  - Fast lookup of user bookings
  - Fast lookup of active rooms

  ## Triggers
  - Automatic profile creation when user signs up
  - Automatic timestamp updates on record modifications

  ## Important Notes
  1. Conflict detection happens at the application layer to provide better UX
  2. Time-based queries use indexes for optimal performance
  3. All timestamps use timestamptz for proper timezone handling
  4. Equipment stored as array for flexible filtering
*/

-- Create enum-like types using check constraints
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('faculty', 'student')),
  department text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('classroom', 'lab')),
  capacity integer NOT NULL CHECK (capacity > 0),
  building text NOT NULL,
  floor text NOT NULL,
  equipment text[] DEFAULT '{}',
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  attendee_count integer NOT NULL CHECK (attendee_count > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS booking_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  conflicting_booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  detected_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolution_notes text
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_room_time ON bookings(room_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_conflicts ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for rooms table
CREATE POLICY "Anyone can view active rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Faculty can insert rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'faculty'
    )
  );

CREATE POLICY "Faculty can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'faculty'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'faculty'
    )
  );

-- Policies for bookings table
CREATE POLICY "Users can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for booking_conflicts table
CREATE POLICY "Users can view conflicts for their bookings"
  ON booking_conflicts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = original_booking_id
      AND bookings.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = conflicting_booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'General')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample rooms for demonstration
INSERT INTO rooms (name, type, capacity, building, floor, equipment, description) VALUES
  ('Room 101', 'classroom', 40, 'Science Block', '1', ARRAY['Projector', 'Whiteboard', 'Audio System'], 'Large lecture hall with modern amenities'),
  ('Room 102', 'classroom', 30, 'Science Block', '1', ARRAY['Projector', 'Whiteboard'], 'Standard classroom'),
  ('Computer Lab A', 'lab', 50, 'Engineering Block', '2', ARRAY['Computers', 'Projector', 'Air Conditioning'], '50 workstations with latest software'),
  ('Computer Lab B', 'lab', 30, 'Engineering Block', '2', ARRAY['Computers', 'Projector'], '30 workstations'),
  ('Physics Lab', 'lab', 25, 'Science Block', '3', ARRAY['Lab Equipment', 'Safety Equipment', 'Whiteboard'], 'Fully equipped physics laboratory'),
  ('Room 201', 'classroom', 50, 'Main Building', '2', ARRAY['Projector', 'Whiteboard', 'Audio System', 'Video Conferencing'], 'Large seminar hall'),
  ('Room 202', 'classroom', 25, 'Main Building', '2', ARRAY['Projector', 'Whiteboard'], 'Small group discussion room'),
  ('Chemistry Lab', 'lab', 30, 'Science Block', '3', ARRAY['Lab Equipment', 'Safety Equipment', 'Fume Hoods'], 'Advanced chemistry laboratory')
ON CONFLICT DO NOTHING;