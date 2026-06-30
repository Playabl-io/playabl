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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
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
          },
        ]
      }
      user_calendars: {
        Row: {
          created_at: string
          id: number
          user_id: string
          webcal_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          user_id: string
          webcal_id: string
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: string
          webcal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_calendars_user_id_fkey"
            columns: ["user_id"]
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
      add_game_cancel_to_notifications: {
        Args: {
          email: string
          game_name: string
          user_id: string
          user_name: string
        }
        Returns: undefined
      }
      add_rsvp_to_notifications: {
        Args: {
          email: string
          game_name: string
          message: string
          related_url: string
          user_id: string
          user_name: string
        }
        Returns: undefined
      }
      add_to_notifications: {
        Args: {
          email: string
          message: string
          related_url: string
          user_id: string
        }
        Returns: undefined
      }
      cancel_game: { Args: { game_id: number }; Returns: undefined }
      dispatch_unread_notifications_emails: { Args: never; Returns: undefined }
      join_session: {
        Args: { session_id: number; user_id: string }
        Returns: undefined
      }
      leave_session: {
        Args: { session_id: number; user_id: string }
        Returns: Record<string, unknown>
      }
      set_session_opening: { Args: { session_id: number }; Returns: undefined }
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
          type: Database["storage"]["Enums"]["buckettype"]
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
          type?: Database["storage"]["Enums"]["buckettype"]
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
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
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
          user_metadata: Json | null
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
          user_metadata?: Json | null
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
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const

