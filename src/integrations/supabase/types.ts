export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      blog_articles: {
        Row: {
          author_id: string
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          published_at: string | null
          slug: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      coach_verifications: {
        Row: {
          coach_id: string | null
          created_at: string | null
          documents_submitted: boolean | null
          id: string
          is_verified: boolean | null
          notes: string | null
          updated_at: string | null
          verification_date: string | null
          verified_by: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          documents_submitted?: boolean | null
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          documents_submitted?: boolean | null
          id?: string
          is_verified?: boolean | null
          notes?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_verifications_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          discount: number
          id: string
          name: string
          price: number
          sessions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount: number
          id?: string
          name: string
          price: number
          sessions: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount?: number
          id?: string
          name?: string
          price?: number
          sessions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      players: {
        Row: {
          coach_id: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          goals: string | null
          id: string
          is_child: boolean | null
          notes: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          skill_level: string | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          goals?: string | null
          id?: string
          is_child?: boolean | null
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          skill_level?: string | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          goals?: string | null
          id?: string
          is_child?: boolean | null
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          skill_level?: string | null
          updated_at?: string
        }
        Relationships: []
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
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          original_transaction_id: string | null
          processed_by: string | null
          reason: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          original_transaction_id?: string | null
          processed_by?: string | null
          reason: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          original_transaction_id?: string | null
          processed_by?: string | null
          reason?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      session_notifications: {
        Row: {
          coach_id: string
          created_at: string
          email_content: Json | null
          error_message: string | null
          id: string
          notification_type: string
          recipient_email: string
          sent_at: string | null
          session_id: string
          status: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          email_content?: Json | null
          error_message?: string | null
          id?: string
          notification_type: string
          recipient_email: string
          sent_at?: string | null
          session_id: string
          status?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          email_content?: Json | null
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_email?: string
          sent_at?: string | null
          session_id?: string
          status?: string | null
        }
        Relationships: []
      }
      session_payments: {
        Row: {
          amount: number | null
          coach_id: string
          created_at: string
          currency: string | null
          due_date: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          player_email: string | null
          session_id: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          coach_id: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          player_email?: string | null
          session_id: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          coach_id?: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          player_email?: string | null
          session_id?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
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
      support_tickets: {
        Row: {
          assignee_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assignee_id?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assignee_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean
          message: string
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          status: string | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          status?: string | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_access_waitlist: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          status: string | null
          years_experience: number | null
        }[]
      }
      admin_confirm_email: {
        Args: { admin_email: string }
        Returns: boolean
      }
      can_access_waitlist: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_payment_link: {
        Args: {
          p_amount: number
          p_currency?: string
          p_description: string
          p_expires_in_days?: number
          p_player_id: string
        }
        Returns: string
      }
      create_payment_notification: {
        Args: {
          p_message: string
          p_related_id?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_player_portal: {
        Args: { p_expires_in_days?: number; p_player_id: string }
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
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role_safely: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_waitlist_entry: {
        Args: {
          p_email: string
          p_full_name: string
          p_message?: string
          p_years_experience: number
        }
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          status: string | null
          years_experience: number | null
        }[]
      }
      is_admin_direct: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_safe_simple: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_simple: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_tennexis_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_user_as_admin: {
        Args: { input_email: string }
        Returns: boolean
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
      app_role: "user" | "tennexis_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "tennexis_admin"],
    },
  },
} as const
