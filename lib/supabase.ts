import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy-loaded client instance
let supabaseInstance: SupabaseClient | null = null;

export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build time when env vars are not available
    console.warn('Supabase URL or Anon Key not found. Using mock client.');
    return null as unknown as SupabaseClient;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
})();

// Get client with runtime check
export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key not configured');
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// Server-side client with service role (for admin operations)
export function createServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Database types (generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          image: string | null;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          image?: string | null;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          image?: string | null;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          color?: string;
        };
      };
      ideas: {
        Row: {
          id: string;
          title: string;
          description: string;
          category_id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'built';
          is_featured: boolean;
          vote_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category_id: string;
          user_id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'built';
          is_featured?: boolean;
          vote_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category_id?: string;
          user_id?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'built';
          is_featured?: boolean;
          vote_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          idea_id: string;
          user_id: string;
          value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          user_id: string;
          value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          user_id?: string;
          value?: number;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          idea_id: string;
          user_id: string;
          parent_id: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          user_id: string;
          parent_id?: string | null;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          user_id?: string;
          parent_id?: string | null;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_ideas: {
        Row: {
          id: string;
          idea_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
      };
      idea_tags: {
        Row: {
          idea_id: string;
          tag_id: string;
        };
        Insert: {
          idea_id: string;
          tag_id: string;
        };
        Update: {
          idea_id?: string;
          tag_id?: string;
        };
      };
      fused_ideas: {
        Row: {
          id: string;
          title: string;
          description: string;
          concept: string;
          source_idea_ids: string[];
          vote_count: number;
          created_by_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          concept: string;
          source_idea_ids: string[];
          vote_count?: number;
          created_by_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          concept?: string;
          source_idea_ids?: string[];
          vote_count?: number;
          created_by_id?: string | null;
          created_at?: string;
        };
      };
      fused_idea_votes: {
        Row: {
          id: string;
          fused_idea_id: string;
          user_id: string;
          value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          fused_idea_id: string;
          user_id: string;
          value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          fused_idea_id?: string;
          user_id?: string;
          value?: number;
          created_at?: string;
        };
      };
      battles: {
        Row: {
          id: string;
          idea1_id: string;
          idea2_id: string;
          idea1_votes: number;
          idea2_votes: number;
          winner_id: string | null;
          status: 'active' | 'completed' | 'cancelled';
          round: number;
          week_number: number;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          idea1_id: string;
          idea2_id: string;
          idea1_votes?: number;
          idea2_votes?: number;
          winner_id?: string | null;
          status?: 'active' | 'completed' | 'cancelled';
          round?: number;
          week_number: number;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          idea1_id?: string;
          idea2_id?: string;
          idea1_votes?: number;
          idea2_votes?: number;
          winner_id?: string | null;
          status?: 'active' | 'completed' | 'cancelled';
          round?: number;
          week_number?: number;
          expires_at?: string;
          created_at?: string;
        };
      };
      battle_votes: {
        Row: {
          id: string;
          battle_id: string;
          user_id: string;
          voted_idea_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          battle_id: string;
          user_id: string;
          voted_idea_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          battle_id?: string;
          user_id?: string;
          voted_idea_id?: string;
          created_at?: string;
        };
      };
      build_claims: {
        Row: {
          id: string;
          idea_id: string;
          builder_id: string;
          status: 'active' | 'completed' | 'abandoned';
          started_at: string;
          completed_at: string | null;
          github_url: string | null;
          live_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          builder_id: string;
          status?: 'active' | 'completed' | 'abandoned';
          started_at?: string;
          completed_at?: string | null;
          github_url?: string | null;
          live_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          builder_id?: string;
          status?: 'active' | 'completed' | 'abandoned';
          started_at?: string;
          completed_at?: string | null;
          github_url?: string | null;
          live_url?: string | null;
          created_at?: string;
        };
      };
      progress_updates: {
        Row: {
          id: string;
          claim_id: string;
          user_id: string;
          type: 'text' | 'image' | 'commit' | 'milestone';
          content: string;
          image_url: string | null;
          commit_url: string | null;
          milestone_title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          claim_id: string;
          user_id: string;
          type: 'text' | 'image' | 'commit' | 'milestone';
          content: string;
          image_url?: string | null;
          commit_url?: string | null;
          milestone_title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          claim_id?: string;
          user_id?: string;
          type?: 'text' | 'image' | 'commit' | 'milestone';
          content?: string;
          image_url?: string | null;
          commit_url?: string | null;
          milestone_title?: string | null;
          created_at?: string;
        };
      };
      idea_interests: {
        Row: {
          id: string;
          idea_id: string;
          user_id: string;
          status: 'interested' | 'building' | 'abandoned';
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          user_id: string;
          status?: 'interested' | 'building' | 'abandoned';
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          user_id?: string;
          status?: 'interested' | 'building' | 'abandoned';
          note?: string | null;
          created_at?: string;
        };
      };
      idea_difficulty_ratings: {
        Row: {
          id: string;
          idea_id: string;
          difficulty_score: number;
          estimated_hours: number;
          tech_stack: string[];
          required_skills: string[];
          complexity_factors: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          idea_id: string;
          difficulty_score: number;
          estimated_hours: number;
          tech_stack: string[];
          required_skills: string[];
          complexity_factors: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          idea_id?: string;
          difficulty_score?: number;
          estimated_hours?: number;
          tech_stack?: string[];
          required_skills?: string[];
          complexity_factors?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
