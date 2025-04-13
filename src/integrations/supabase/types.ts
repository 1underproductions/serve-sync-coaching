export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      coach_preferences: {
        Row: {
          auto_email_session_notes: boolean | null
          coach_id: string
          include_progress_metrics: boolean | null
          include_video_links: boolean | null
          updated_at: string | null
        }
        Insert: {
          auto_email_session_notes?: boolean | null
          coach_id: string
          include_progress_metrics?: boolean | null
          include_video_links?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auto_email_session_notes?: boolean | null
          coach_id?: string
          include_progress_metrics?: boolean | null
          include_video_links?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_preferences_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_links: {
        Row: {
          amount: number
          coach_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          expires_at: string | null
          id: string
          player_id: string | null
          session_id: string | null
          status: string | null
          stripe_checkout_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          coach_id: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          player_id?: string | null
          session_id?: string | null
          status?: string | null
          stripe_checkout_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          coach_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          player_id?: string | null
          session_id?: string | null
          status?: string | null
          stripe_checkout_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      player_contacts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_primary_payer: boolean | null
          name: string
          phone: string | null
          player_id: string
          receive_invoices: boolean | null
          receive_session_notes: boolean | null
          relationship: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_primary_payer?: boolean | null
          name: string
          phone?: string | null
          player_id: string
          receive_invoices?: boolean | null
          receive_session_notes?: boolean | null
          relationship?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_primary_payer?: boolean | null
          name?: string
          phone?: string | null
          player_id?: string
          receive_invoices?: boolean | null
          receive_session_notes?: boolean | null
          relationship?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      player_portals: {
        Row: {
          access_code: string
          coach_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          player_id: string
          updated_at: string | null
        }
        Insert: {
          access_code: string
          coach_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          player_id: string
          updated_at?: string | null
        }
        Update: {
          access_code?: string
          coach_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          player_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_portals_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          hourly_rate: number | null
          id: string
          location: string | null
          phone: string | null
          role: string | null
          updated_at: string
          website: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          location?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          website?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          payment_status: string
          player_id: string | null
          requires_prepayment: boolean | null
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          payment_status?: string
          player_id?: string | null
          requires_prepayment?: boolean | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          payment_status?: string
          player_id?: string | null
          requires_prepayment?: boolean | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_payment_link: {
        Args: {
          p_player_id: string
          p_description: string
          p_amount: number
          p_currency?: string
          p_expires_in_days?: number
        }
        Returns: string
      }
      create_player_portal: {
        Args: { p_player_id: string; p_expires_in_days?: number }
        Returns: string
      }
      generate_access_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_hourly_rate: {
        Args: { hourly_rate: number }
        Returns: undefined
      }
      update_user_avatar_safe: {
        Args: { new_avatar_url: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
