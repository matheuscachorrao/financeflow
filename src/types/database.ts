export type TransactionType = 'entrada' | 'saida'

export type PaymentMethod =
  | 'dinheiro'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'pix'
  | 'transferencia'
  | 'boleto'
  | 'outro'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: TransactionType | 'ambos'
  color: string
  icon: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string
  category_id: string | null
  category?: Category
  payment_method: PaymentMethod
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DashboardSummary {
  totalEntradas: number
  totalSaidas: number
  saldo: number
  transacoes: Transaction[]
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'user_id'>>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'category'>
        Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id' | 'category'>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
