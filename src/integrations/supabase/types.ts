/**
 * Type utilities and helpers for Supabase database types
 * @package Database Types
 */

/**
 * Represents JSON compatible values
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Utility type for timestamp fields
 */
export type Timestamp = string

/**
 * Utility type for UUID fields
 */
export type UUID = string

/**
 * Common timestamp fields for database tables
 */
export interface TimestampFields {
  created_at: Timestamp
  updated_at?: Timestamp
}

/**
 * Common fields for all database tables
 */
export interface BaseFields {
  id: UUID
}

/**
 * Quest types enumeration
 */
export enum QuestType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  ACHIEVEMENT = 'achievement',
  ONBOARDING = 'onboarding'
}

/**
 * Quest categories enumeration
 */
export enum QuestCategory {
  LEARNING = 'learning',
  ENGAGEMENT = 'engagement',
  SOCIAL = 'social',
  PROGRESS = 'progress'
}

/**
 * Note types enumeration
 */
export enum NoteType {
  SUMMARY = 'summary',
  DETAILED = 'detailed',
  MINDMAP = 'mindmap',
  FLASHCARDS = 'flashcards'
}

/**
 * Input types for uploads
 */
export enum InputType {
  PDF = 'pdf',
  IMAGE = 'image',
  TEXT = 'text',
  URL = 'url'
}

/**
 * Utility type to make all properties optional
 */
export type Optional<T> = {
  [P in keyof T]?: T[P]
}

/**
 * Utility type for pagination
 */
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface Database {
  public: {
    Tables: {
      topics: {
        Row: BaseFields & {
          title: string
          description: string
          icon: string
          xp_reward: number
        }
        Insert: Optional<Omit<Database['public']['Tables']['topics']['Row'], 'id'>>
        Update: Optional<Database['public']['Tables']['topics']['Row']>
      }
      flashcards: {
        Row: BaseFields & TimestampFields & {
          topic_id: UUID
          sl_no: number
          front: string
          back: string
          user_id: UUID
        }
        Insert: Optional<Omit<Database['public']['Tables']['flashcards']['Row'], 'id' | 'created_at'>>
        Update: Optional<Database['public']['Tables']['flashcards']['Row']>
      }
      missed_dates: {
        Row: BaseFields & {
          user_id: UUID
          missed_date: string
        }
        Insert: Optional<Omit<Database['public']['Tables']['missed_dates']['Row'], 'id'>>
        Update: Optional<Database['public']['Tables']['missed_dates']['Row']>
      }
      notes: {
        Row: BaseFields & TimestampFields & {
          topic_id: UUID
          syllabus_id: UUID
          html_content: string
          pdf_url: string
          note_type: NoteType
          session_number: number
          total_sessions: number
          title: string
          user_id: UUID
        }
        Insert: Optional<Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at'>>
        Update: Optional<Database['public']['Tables']['notes']['Row']>
      }
      users: {
        Row: BaseFields & TimestampFields & {
          full_name: string
          email: string
          age: number
          class: string
          state: string
          board: string
          purpose: string
          profile_image_url: string
          xp: number
          level: number
          streak: number
          neurons: number
          joined_date: Timestamp
          quests_completed: number
          is_guest: boolean
          onboarding_complete: boolean
        }
        Insert: Optional<Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'xp' | 'level' | 'streak' | 'neurons' | 'quests_completed'>>
        Update: Optional<Database['public']['Tables']['users']['Row']>
      }
      quests: {
        Row: BaseFields & {
          title: string
          description: string
          xp_reward: number
          type: QuestType
          required_progress: number
          next_quest_id: UUID | null
          category: QuestCategory
        }
        Insert: Optional<Omit<Database['public']['Tables']['quests']['Row'], 'id'>>
        Update: Optional<Database['public']['Tables']['quests']['Row']>
      }
      quiz_attempts: {
        Row: BaseFields & {
          user_id: UUID
          topic_id: UUID
          score: number
          total: number
          attempted_at: Timestamp
        }
        Insert: Optional<Omit<Database['public']['Tables']['quiz_attempts']['Row'], 'id' | 'attempted_at'>>
        Update: Optional<Database['public']['Tables']['quiz_attempts']['Row']>
      }
      login_history: {
        Row: BaseFields & {
          user_id: UUID
          login_date: string
        }
        Insert: Optional<Omit<Database['public']['Tables']['login_history']['Row'], 'id'>>
        Update: Optional<Database['public']['Tables']['login_history']['Row']>
      }
      study_sessions: {
        Row: BaseFields & TimestampFields & {
          user_id: UUID
          start_time: Timestamp
          end_time: Timestamp
        }
        Insert: Optional<Omit<Database['public']['Tables']['study_sessions']['Row'], 'id' | 'created_at'>>
        Update: Optional<Database['public']['Tables']['study_sessions']['Row']>
      }
      uploads: {
        Row: BaseFields & TimestampFields & {
          user_id: UUID
          input_type: InputType
          original_file: string
          raw_text: string
          subject_name: string
          analyzed: boolean
        }
        Insert: Optional<Omit<Database['public']['Tables']['uploads']['Row'], 'id' | 'created_at' | 'analyzed'>>
        Update: Optional<Database['public']['Tables']['uploads']['Row']>
      }
      syllabus_topics: {
        Row: BaseFields & TimestampFields & {
          syllabus_id: UUID
          topic_number: number
          topic_title: string
          chapters_range: string
        }
        Insert: Optional<Omit<Database['public']['Tables']['syllabus_topics']['Row'], 'id' | 'created_at'>>
        Update: Optional<Database['public']['Tables']['syllabus_topics']['Row']>
      }
      study_time: {
        Row: BaseFields & TimestampFields & {
          user_id: UUID
          session_minutes: number
          date: string
          day: number
          week: number
          month: number
          year: number
        }
        Insert: Optional<Omit<Database['public']['Tables']['study_time']['Row'], 'id' | 'created_at'>>
        Update: Optional<Database['public']['Tables']['study_time']['Row']>
      }
      user_achievements: {
        Row: BaseFields & {
          user_id: UUID
          achievement_id: UUID
          earned_at: Timestamp
        }
        Insert: Optional<Omit<Database['public']['Tables']['user_achievements']['Row'], 'id' | 'earned_at'>>
        Update: Optional<Database['public']['Tables']['user_achievements']['Row']>
      }
      daily_stats: {
        Row: BaseFields & TimestampFields & {
          user_id: UUID
          date: string
          notes_generated: number
          flashcards_generated: number
          quizzes_given: number
        }
        Insert: Optional<Omit<Database['public']['Tables']['daily_stats']['Row'], 'id' | 'created_at'>>
        Update: Optional<Database['public']['Tables']['daily_stats']['Row']>
      }
      user_quests: {
        Row: BaseFields & {
          user_id: UUID
          quest_id: string
          is_claimed: boolean
          current_progress: number
          last_updated: Timestamp
        }
        Insert: Optional<Omit<Database['public']['Tables']['user_quests']['Row'], 'id' | 'is_claimed' | 'current_progress' | 'last_updated'>>
        Update: Optional<Database['public']['Tables']['user_quests']['Row']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      quest_type: QuestType
      quest_category: QuestCategory
      note_type: NoteType
      input_type: InputType
    }
  }
}

// Export commonly used types
export type Tables = Database['public']['Tables']
export type TablesInsert = {
  [K in keyof Tables]: Tables[K]['Insert']
}
export type TablesUpdate = {
  [K in keyof Tables]: Tables[K]['Update']
}
export type TablesRow = {
  [K in keyof Tables]: Tables[K]['Row']
}

// Helper function types for common database operations
export type WhereFilter<T> = Partial<{
  [K in keyof T]: T[K] | { eq: T[K] } | { neq: T[K] } | { gt: T[K] } | { gte: T[K] } | { lt: T[K] } | { lte: T[K] } | { in: T[K][] } | { is: null }
}>

export type OrderBy<T> = {
  column: keyof T
  ascending?: boolean
}
