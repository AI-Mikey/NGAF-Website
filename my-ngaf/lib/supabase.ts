import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://grqvmycijwfzlcbfrilt.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycXZteWNpandmemxjYmZyaWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjkyODMsImV4cCI6MjA2NzY0NTI4M30.x-Uh42FM3dmVcq821FnGzGB19Zn_npJxb3EmMq9QFdE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          name: string
          file_path: string
          folder_id: string
          user_id: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          file_path: string
          folder_id: string
          user_id: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          file_path?: string
          folder_id?: string
          user_id?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
