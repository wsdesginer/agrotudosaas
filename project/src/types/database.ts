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
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          avatar_url: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          avatar_url?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          avatar_url?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          icon?: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          address: string
          products: string
          billing_day: number
          billing_amount: number
          billing_status: string
          last_payment_date: string | null
          next_due_date: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string
          email?: string
          address?: string
          products?: string
          billing_day?: number
          billing_amount?: number
          billing_status?: string
          last_payment_date?: string | null
          next_due_date?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          address?: string
          products?: string
          billing_day?: number
          billing_amount?: number
          billing_status?: string
          last_payment_date?: string | null
          next_due_date?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          category_id: string | null
          supplier_id: string | null
          quantity: number
          min_quantity: number
          cost_price: number
          sale_price: number
          unit: string
          barcode: string
          image_url: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          category_id?: string | null
          supplier_id?: string | null
          quantity?: number
          min_quantity?: number
          cost_price?: number
          sale_price?: number
          unit?: string
          barcode?: string
          image_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category_id?: string | null
          supplier_id?: string | null
          quantity?: number
          min_quantity?: number
          cost_price?: number
          sale_price?: number
          unit?: string
          barcode?: string
          image_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          type: string
          category: string
          description: string
          amount: number
          payment_method: string
          reference: string
          product_id: string | null
          supplier_id: string | null
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          category?: string
          description: string
          amount: number
          payment_method?: string
          reference?: string
          product_id?: string | null
          supplier_id?: string | null
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          category?: string
          description?: string
          amount?: number
          payment_method?: string
          reference?: string
          product_id?: string | null
          supplier_id?: string | null
          transaction_date?: string
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          type: string
          severity: string
          title: string
          message: string
          reference_id: string | null
          reference_type: string
          is_read: boolean
          is_resolved: boolean
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          type: string
          severity?: string
          title: string
          message: string
          reference_id?: string | null
          reference_type?: string
          is_read?: boolean
          is_resolved?: boolean
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          severity?: string
          title?: string
          message?: string
          reference_id?: string | null
          reference_type?: string
          is_read?: boolean
          is_resolved?: boolean
          created_at?: string
          resolved_at?: string | null
        }
      }
      ai_insights: {
        Row: {
          id: string
          type: string
          title: string
          message: string
          suggestion: string
          data: Json
          relevance_score: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          message: string
          suggestion?: string
          data?: Json
          relevance_score?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          message?: string
          suggestion?: string
          data?: Json
          relevance_score?: number
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
export type AIInsight = Database['public']['Tables']['ai_insights']['Row']
