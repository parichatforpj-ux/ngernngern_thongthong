export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
}

export interface CreateTransactionInput {
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

export interface UpdateTransactionInput {
  type?: 'income' | 'expense'
  amount?: number
  category?: string
  description?: string
  date?: string
}
