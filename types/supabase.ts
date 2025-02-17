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
      products: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string
          price: number
          category_id: number
          stock: number
          image_url: string
          is_flash_sale: boolean
          discount_percentage: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description: string
          price: number
          category_id: number
          stock: number
          image_url: string
          is_flash_sale?: boolean
          discount_percentage?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string
          price?: number
          category_id?: number
          stock?: number
          image_url?: string
          is_flash_sale?: boolean
          discount_percentage?: number | null
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          icon?: string
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: number
          user_id: string
          product_id: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          quantity: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          quantity?: number
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          product_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          created_at?: string
        }
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
  }
}
