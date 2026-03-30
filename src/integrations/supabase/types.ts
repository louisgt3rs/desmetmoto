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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          categories: string[]
          category: string | null
          country: string | null
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          logo_url: string | null
          name: string
          sort_order: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          categories?: string[]
          category?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          categories?: string[]
          category?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number
          created_at: string
          date: string | null
          description: string | null
          event_date: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          is_upcoming: boolean
          location: string | null
          registered_count: number
          sort_order: number | null
          time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          date?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          is_upcoming?: boolean
          location?: string | null
          registered_count?: number
          sort_order?: number | null
          time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          date?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          is_upcoming?: boolean
          location?: string | null
          registered_count?: number
          sort_order?: number | null
          time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_slot_bookings: {
        Row: {
          created_at: string
          date: string
          email: string
          event_id: string
          first_name: string
          id: string
          last_name: string
          newsletter_consent: boolean
          phone: string
          slot_item_id: string
          slot_time: string
        }
        Insert: {
          created_at?: string
          date: string
          email: string
          event_id: string
          first_name: string
          id?: string
          last_name: string
          newsletter_consent: boolean
          phone: string
          slot_item_id: string
          slot_time: string
        }
        Update: {
          created_at?: string
          date?: string
          email?: string
          event_id?: string
          first_name?: string
          id?: string
          last_name?: string
          newsletter_consent?: boolean
          phone?: string
          slot_item_id?: string
          slot_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_slot_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_slot_bookings_slot_item_id_fkey"
            columns: ["slot_item_id"]
            isOneToOne: false
            referencedRelation: "event_slot_items"
            referencedColumns: ["id"]
          },
        ]
      }
      event_slot_items: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_slot_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_slots_config: {
        Row: {
          capacity: number | null
          created_at: string
          date: string
          end_time: string
          event_id: string
          id: string
          is_active: boolean
          note: string | null
          slot_duration_minutes: number
          start_time: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          date: string
          end_time: string
          event_id: string
          id?: string
          is_active?: boolean
          note?: string | null
          slot_duration_minutes?: number
          start_time: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          date?: string
          end_time?: string
          event_id?: string
          id?: string
          is_active?: boolean
          note?: string | null
          slot_duration_minutes?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_slots_config_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string | null
          id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          sort_order?: number | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      helmet_colorways: {
        Row: {
          available: boolean | null
          created_at: string
          gallery_images: string[] | null
          id: string
          images_360: string[] | null
          main_image_url: string | null
          model_id: string
          name: string
          slug: string
          sort_order: number | null
          stock_by_size: Json | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          created_at?: string
          gallery_images?: string[] | null
          id?: string
          images_360?: string[] | null
          main_image_url?: string | null
          model_id: string
          name: string
          slug: string
          sort_order?: number | null
          stock_by_size?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          created_at?: string
          gallery_images?: string[] | null
          id?: string
          images_360?: string[] | null
          main_image_url?: string | null
          model_id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          stock_by_size?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "helmet_colorways_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "helmet_models"
            referencedColumns: ["id"]
          },
        ]
      }
      helmet_models: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          sizes: string[] | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          sizes?: string[] | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          sizes?: string[] | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_colorways: {
        Row: {
          created_at: string | null
          gallery_images: string[] | null
          id: string
          image_url: string | null
          name: string
          product_id: string
          sort_order: number | null
          stock_by_size: Json | null
        }
        Insert: {
          created_at?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          product_id: string
          sort_order?: number | null
          stock_by_size?: Json | null
        }
        Update: {
          created_at?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          product_id?: string
          sort_order?: number | null
          stock_by_size?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "product_colorways_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          brand_id: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          in_stock: boolean
          is_featured: boolean | null
          name: string
          price: number | null
          price_range: string | null
          sizes: string[] | null
          sort_order: number | null
          stock_by_size: Json | null
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          brand?: string | null
          brand_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean
          is_featured?: boolean | null
          name: string
          price?: number | null
          price_range?: string | null
          sizes?: string[] | null
          sort_order?: number | null
          stock_by_size?: Json | null
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          brand?: string | null
          brand_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean
          is_featured?: boolean | null
          name?: string
          price?: number | null
          price_range?: string | null
          sizes?: string[] | null
          sort_order?: number | null
          stock_by_size?: Json | null
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          phone: string | null
          product_name: string
          size: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          product_name: string
          size?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          product_name?: string
          size?: string | null
          status?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
