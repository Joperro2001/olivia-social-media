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
      ai_agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_id: string
          id: string
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          category: string
          checklist_id: string
          created_at: string
          id: string
          is_checked: boolean
          item_text: string
          updated_at: string
        }
        Insert: {
          category: string
          checklist_id: string
          created_at?: string
          id?: string
          is_checked?: boolean
          item_text: string
          updated_at?: string
        }
        Update: {
          category?: string
          checklist_id?: string
          created_at?: string
          id?: string
          is_checked?: boolean
          item_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "packing_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      city_matches: {
        Row: {
          city: string
          created_at: string
          id: string
          match_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          match_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          match_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          event_id: string
          id: string
          rsvp_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          rsvp_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          rsvp_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tags: {
        Row: {
          event_id: string
          id: string
          tag: string
        }
        Insert: {
          event_id: string
          id?: string
          tag: string
        }
        Update: {
          event_id?: string
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tags_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          created_at: string
          creator_id: string
          date: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          creator_id: string
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          creator_id?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          title?: string
        }
        Relationships: []
      }
      group_matches: {
        Row: {
          group_id: string
          id: string
          matched_at: string
          status: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          matched_at?: string
          status?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          matched_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_matches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_tags: {
        Row: {
          group_id: string
          id: string
          tag: string
        }
        Insert: {
          group_id: string
          id?: string
          tag: string
        }
        Update: {
          group_id?: string
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_tags_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          member_count: number | null
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          member_count?: number | null
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          member_count?: number | null
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          id: string
          read_at: string | null
          sender_id: string
          sent_at: string
        }
        Insert: {
          chat_id: string
          content: string
          id?: string
          read_at?: string | null
          sender_id: string
          sent_at?: string
        }
        Update: {
          chat_id?: string
          content?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_checklists: {
        Row: {
          created_at: string
          destination: string
          duration: string | null
          id: string
          purpose: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          duration?: string | null
          id?: string
          purpose?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          duration?: string | null
          id?: string
          purpose?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_matches: {
        Row: {
          id: string
          matched_at: string
          status: string
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          id?: string
          matched_at?: string
          status?: string
          user_id_1: string
          user_id_2: string
        }
        Update: {
          id?: string
          matched_at?: string
          status?: string
          user_id_1?: string
          user_id_2?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_me: string | null
          age: number | null
          avatar_url: string | null
          created_at: string
          current_city: string | null
          full_name: string | null
          id: string
          move_in_city: string | null
          nationality: string | null
          relocation_interests: string[] | null
          relocation_status: string | null
          relocation_timeframe: string | null
          university: string | null
          updated_at: string
        }
        Insert: {
          about_me?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          current_city?: string | null
          full_name?: string | null
          id: string
          move_in_city?: string | null
          nationality?: string | null
          relocation_interests?: string[] | null
          relocation_status?: string | null
          relocation_timeframe?: string | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          about_me?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          current_city?: string | null
          full_name?: string | null
          id?: string
          move_in_city?: string | null
          nationality?: string | null
          relocation_interests?: string[] | null
          relocation_status?: string | null
          relocation_timeframe?: string | null
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_checklists: {
        Row: {
          checklist_data: Json
          checklist_id: string
          created_at: string | null
          description: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checklist_data: Json
          checklist_id?: string
          created_at?: string | null
          description?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checklist_data?: Json
          checklist_id?: string
          created_at?: string | null
          description?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_conversations: {
        Row: {
          content: string
          message_id: string
          message_type: string
          session_id: string
          summary_flag: boolean | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          content: string
          message_id?: string
          message_type: string
          session_id: string
          summary_flag?: boolean | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          content?: string
          message_id?: string
          message_type?: string
          session_id?: string
          summary_flag?: boolean | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string
          id: string
          interest: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interest: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interest?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_user_id_fkey"
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
      get_or_create_private_chat: {
        Args: { other_user_id: string }
        Returns: string
      }
      get_user_chats: {
        Args: { user_id: string }
        Returns: string[]
      }
      is_chat_participant: {
        Args: { chat_id: string; user_id: string } | { chat_uuid: string }
        Returns: boolean
      }
      migrate_old_data: {
        Args: Record<PropertyKey, never>
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
