export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'faculty' | 'student'
          department: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'faculty' | 'student'
          department: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'faculty' | 'student'
          department?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          type: 'classroom' | 'lab'
          capacity: number
          building: string
          floor: string
          equipment: string[]
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'classroom' | 'lab'
          capacity: number
          building: string
          floor: string
          equipment?: string[]
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'classroom' | 'lab'
          capacity?: number
          building?: string
          floor?: string
          equipment?: string[]
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          room_id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled'
          attendee_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          attendee_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          attendee_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      booking_conflicts: {
        Row: {
          id: string
          original_booking_id: string
          conflicting_booking_id: string
          detected_at: string
          resolved: boolean
          resolution_notes: string | null
        }
        Insert: {
          id?: string
          original_booking_id: string
          conflicting_booking_id: string
          detected_at?: string
          resolved?: boolean
          resolution_notes?: string | null
        }
        Update: {
          id?: string
          original_booking_id?: string
          conflicting_booking_id?: string
          detected_at?: string
          resolved?: boolean
          resolution_notes?: string | null
        }
      }
    }
  }
}
