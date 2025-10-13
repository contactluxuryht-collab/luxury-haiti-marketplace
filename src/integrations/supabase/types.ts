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
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          product_id: string
          start_date: string | null
          threshold: number
          title: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          product_id: string
          start_date?: string | null
          threshold: number
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          product_id?: string
          start_date?: string | null
          threshold?: number
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          category_id: string | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_best_seller: boolean | null
          delivery_available: boolean | null
          delivery_price: number | null
          price: number
          quantity: number | null
          seller_id: string
          size: string | null
          title: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_best_seller?: boolean | null
          delivery_available?: boolean | null
          delivery_price?: number | null
          price: number
          quantity?: number | null
          seller_id: string
          size?: string | null
          title: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_best_seller?: boolean | null
          delivery_available?: boolean | null
          delivery_price?: number | null
          price?: number
          quantity?: number | null
          seller_id?: string
          size?: string | null
          title?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          auth_id: string
          created_at: string | null
          email: string
          id: string
          name: string | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id: string
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cart: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          total_amount: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          total_amount?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          total_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number | null
          product_id: string
          quantity: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price?: number | null
          product_id: string
          quantity?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number | null
          product_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
