
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
      forms: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          country: string | null
          company: string | null
          position: string | null
          department: string | null
          start_date: string | null
          salary: number | null
          education: string | null
          skills: string | null
          languages: string | null
          certifications: string | null
          bio: string | null
          website: string | null
          linkedin: string | null
          twitter: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          company?: string | null
          position?: string | null
          department?: string | null
          start_date?: string | null
          salary?: number | null
          education?: string | null
          skills?: string | null
          languages?: string | null
          certifications?: string | null
          bio?: string | null
          website?: string | null
          linkedin?: string | null
          twitter?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          company?: string | null
          position?: string | null
          department?: string | null
          start_date?: string | null
          salary?: number | null
          education?: string | null
          skills?: string | null
          languages?: string | null
          certifications?: string | null
          bio?: string | null
          website?: string | null
          linkedin?: string | null
          twitter?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      login_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          created_at: string
          user_agent: string | null
          ip_address: string | null
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          created_at?: string
          user_agent?: string | null
          ip_address?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          created_at?: string
          user_agent?: string | null
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
          full_name: string | null
          avatar_url: string | null
          last_sign_in: string | null
        }
        Insert: {
          id: string
          email: string
          role: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          last_sign_in?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          last_sign_in?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
