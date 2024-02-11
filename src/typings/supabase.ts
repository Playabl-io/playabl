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
      access_levels: {
        Row: {
          apply_on_join: boolean
          community_id: string
          created_at: string | null
          id: number
          is_mandatory: boolean
          name: string | null
          priority_access_time: number
          time_denomination: string
        }
        Insert: {
          apply_on_join?: boolean
          community_id: string
          created_at?: string | null
          id?: number
          is_mandatory?: boolean
          name?: string | null
          priority_access_time: number
          time_denomination?: string
        }
        Update: {
          apply_on_join?: boolean
          community_id?: string
          created_at?: string | null
          id?: number
          is_mandatory?: boolean
          name?: string | null
          priority_access_time?: number
          time_denomination?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_levels_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      communities: {
        Row: {
          allow_pre_seat: boolean
          allow_public_signup: boolean | null
          banned_emails: string[] | null
          code_of_conduct_url: string | null
          cover_image: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          discord: string | null
          facebook: string | null
          furthest_posting_date: number | null
          game_types: string[] | null
          how_to_join: string | null
          id: string
          join_payment_link: string | null
          join_payment_link_id: string | null
          join_price_id: string | null
          name: string
          owner_id: string
          patreon: string | null
          signup_method: string
          slack: string | null
          stripe_account_id: string | null
          support_email: string | null
          support_message_subscriptions: Json[] | null
          twitter: string | null
          url_short_name: string | null
          website: string | null
        }
        Insert: {
          allow_pre_seat?: boolean
          allow_public_signup?: boolean | null
          banned_emails?: string[] | null
          code_of_conduct_url?: string | null
          cover_image?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          discord?: string | null
          facebook?: string | null
          furthest_posting_date?: number | null
          game_types?: string[] | null
          how_to_join?: string | null
          id?: string
          join_payment_link?: string | null
          join_payment_link_id?: string | null
          join_price_id?: string | null
          name: string
          owner_id: string
          patreon?: string | null
          signup_method?: string
          slack?: string | null
          stripe_account_id?: string | null
          support_email?: string | null
          support_message_subscriptions?: Json[] | null
          twitter?: string | null
          url_short_name?: string | null
          website?: string | null
        }
        Update: {
          allow_pre_seat?: boolean
          allow_public_signup?: boolean | null
          banned_emails?: string[] | null
          code_of_conduct_url?: string | null
          cover_image?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          discord?: string | null
          facebook?: string | null
          furthest_posting_date?: number | null
          game_types?: string[] | null
          how_to_join?: string | null
          id?: string
          join_payment_link?: string | null
          join_payment_link_id?: string | null
          join_price_id?: string | null
          name?: string
          owner_id?: string
          patreon?: string | null
          signup_method?: string
          slack?: string | null
          stripe_account_id?: string | null
          support_email?: string | null
          support_message_subscriptions?: Json[] | null
          twitter?: string | null
          url_short_name?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      community_access: {
        Row: {
          access_level_id: number | null
          community_id: string | null
          created_at: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          access_level_id?: number | null
          community_id?: string | null
          created_at?: string | null
          id?: number
          user_id?: string | null
        }
        Update: {
          access_level_id?: number | null
          community_id?: string | null
          created_at?: string | null
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_access_access_level_id_fkey"
            columns: ["access_level_id"]
            isOneToOne: false
            referencedRelation: "access_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_access_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      community_events: {
        Row: {
          community_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          draft_state: string | null
          end_time: number
          event_access_levels: number[] | null
          fixed_access_time: number | null
          id: number
          rsvp_model: string
          start_time: number
          title: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          draft_state?: string | null
          end_time: number
          event_access_levels?: number[] | null
          fixed_access_time?: number | null
          id?: number
          rsvp_model: string
          start_time: number
          title: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          draft_state?: string | null
          end_time?: number
          event_access_levels?: number[] | null
          fixed_access_time?: number | null
          id?: number
          rsvp_model?: string
          start_time?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      community_invites: {
        Row: {
          community_id: string
          created_at: string | null
          id: string
          is_revoked: boolean
        }
        Insert: {
          community_id: string
          created_at?: string | null
          id?: string
          is_revoked?: boolean
        }
        Update: {
          community_id?: string
          created_at?: string | null
          id?: string
          is_revoked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "community_invites_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      community_membership_requests: {
        Row: {
          community_id: string
          created_at: string | null
          id: number
          message: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string | null
          id?: number
          message?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string | null
          id?: number
          message?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_membership_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_membership_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      community_memberships: {
        Row: {
          community_id: string
          created_at: string | null
          id: number
          role_id: number
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string | null
          id?: number
          role_id: number
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string | null
          id?: number
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_memberships_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      draft_games: {
        Row: {
          created_at: string
          enabled_access_levels: Json
          game_json: Json
          id: number
          preseating_json: Json | null
          sessions_json: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled_access_levels?: Json
          game_json: Json
          id?: number
          preseating_json?: Json | null
          sessions_json: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled_access_levels?: Json
          game_json?: Json
          id?: number
          preseating_json?: Json | null
          sessions_json?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      flags: {
        Row: {
          community_ids: string[] | null
          created_at: string | null
          flag: string
          id: number
          user_ids: string[] | null
        }
        Insert: {
          community_ids?: string[] | null
          created_at?: string | null
          flag: string
          id?: number
          user_ids?: string[] | null
        }
        Update: {
          community_ids?: string[] | null
          created_at?: string | null
          flag?: string
          id?: number
          user_ids?: string[] | null
        }
        Relationships: []
      }
      game_details: {
        Row: {
          created_at: string | null
          detail_blocks: Json | null
          game_id: number | null
          id: number
        }
        Insert: {
          created_at?: string | null
          detail_blocks?: Json | null
          game_id?: number | null
          id?: number
        }
        Update: {
          created_at?: string | null
          detail_blocks?: Json | null
          game_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_details_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      }
      games: {
        Row: {
          community_id: string
          cover_image: string | null
          created_at: string | null
          creator_id: string
          deleted_at: string | null
          description: Json | null
          description_as_flat_text: string | null
          draft_state: string | null
          event_id: number | null
          id: number
          participant_count: number
          system: string | null
          title: string
          uses_safety_tools: boolean | null
          virtual_tabletop: string | null
          will_be_recorded: boolean | null
        }
        Insert: {
          community_id: string
          cover_image?: string | null
          created_at?: string | null
          creator_id: string
          deleted_at?: string | null
          description?: Json | null
          description_as_flat_text?: string | null
          draft_state?: string | null
          event_id?: number | null
          id?: number
          participant_count: number
          system?: string | null
          title: string
          uses_safety_tools?: boolean | null
          virtual_tabletop?: string | null
          will_be_recorded?: boolean | null
        }
        Update: {
          community_id?: string
          cover_image?: string | null
          created_at?: string | null
          creator_id?: string
          deleted_at?: string | null
          description?: Json | null
          description_as_flat_text?: string | null
          draft_state?: string | null
          event_id?: number | null
          id?: number
          participant_count?: number
          system?: string | null
          title?: string
          uses_safety_tools?: boolean | null
          virtual_tabletop?: string | null
          will_be_recorded?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "games_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          }
        ]
      }
      integrations: {
        Row: {
          community_id: string
          created_at: string | null
          endpoint: string
          id: number
          is_active: boolean
          name: string
          slack_access_token: string | null
          slack_configuration: Json | null
          triggers: Json[]
          type: string
          updated_at: string | null
        }
        Insert: {
          community_id: string
          created_at?: string | null
          endpoint: string
          id?: number
          is_active: boolean
          name: string
          slack_access_token?: string | null
          slack_configuration?: Json | null
          triggers: Json[]
          type: string
          updated_at?: string | null
        }
        Update: {
          community_id?: string
          created_at?: string | null
          endpoint?: string
          id?: number
          is_active?: boolean
          name?: string
          slack_access_token?: string | null
          slack_configuration?: Json | null
          triggers?: Json[]
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          created_at: string | null
          from: string
          id: number
          message: string
          record_type: string | null
          to: string[]
          topic_id: string
          topic_type: string
        }
        Insert: {
          created_at?: string | null
          from: string
          id?: number
          message: string
          record_type?: string | null
          to: string[]
          topic_id: string
          topic_type: string
        }
        Update: {
          created_at?: string | null
          from?: string
          id?: number
          message?: string
          record_type?: string | null
          to?: string[]
          topic_id?: string
          topic_type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          id: number
          message: string | null
          read: boolean | null
          related_url: string | null
          type: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: number
          message?: string | null
          read?: boolean | null
          related_url?: string | null
          type?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: number
          message?: string | null
          read?: boolean | null
          related_url?: string | null
          type?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          email: string | null
          email_preferences: Json | null
          id: string
          pronouns: string | null
          subscriptions: string[] | null
          twitter: string | null
          updated_at: string | null
          user_settings: Json | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          email_preferences?: Json | null
          id?: string
          pronouns?: string | null
          subscriptions?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          user_settings?: Json | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          email_preferences?: Json | null
          id?: string
          pronouns?: string | null
          subscriptions?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          user_settings?: Json | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          access_times: Json
          community_id: string
          created_at: string
          creator_id: string | null
          deleted_at: string | null
          end_time: number
          game_id: number
          has_openings: boolean | null
          id: number
          participant_count: number | null
          rsvps: string[] | null
          start_time: number
        }
        Insert: {
          access_times: Json
          community_id: string
          created_at?: string
          creator_id?: string | null
          deleted_at?: string | null
          end_time: number
          game_id: number
          has_openings?: boolean | null
          id?: number
          participant_count?: number | null
          rsvps?: string[] | null
          start_time: number
        }
        Update: {
          access_times?: Json
          community_id?: string
          created_at?: string
          creator_id?: string | null
          deleted_at?: string | null
          end_time?: number
          game_id?: number
          has_openings?: boolean | null
          id?: number
          participant_count?: number | null
          rsvps?: string[] | null
          start_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_game_cancel_to_notifications: {
        Args: {
          user_id: string
          user_name: string
          email: string
          game_name: string
        }
        Returns: undefined
      }
      add_rsvp_to_notifications: {
        Args: {
          user_id: string
          user_name: string
          email: string
          game_name: string
          related_url: string
          message: string
        }
        Returns: undefined
      }
      add_to_notifications: {
        Args: {
          user_id: string
          message: string
          related_url: string
          email: string
        }
        Returns: undefined
      }
      cancel_game: {
        Args: {
          game_id: number
        }
        Returns: undefined
      }
      dispatch_unread_notifications_emails: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      join_session: {
        Args: {
          user_id: string
          session_id: number
        }
        Returns: undefined
      }
      leave_session: {
        Args: {
          user_id: string
          session_id: number
        }
        Returns: Record<string, unknown>
      }
      set_session_opening: {
        Args: {
          session_id: number
        }
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

