import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../entities/transaction'

export interface TransactionRepository {
  findAll(): Promise<Transaction[]>
  findById(id: string): Promise<Transaction | null>
  findByType(type: 'income' | 'expense'): Promise<Transaction[]>
  create(input: CreateTransactionInput): Promise<Transaction>
  update(id: string, input: UpdateTransactionInput): Promise<Transaction | null>
  delete(id: string): Promise<boolean>
  getSummary(): Promise<{ totalIncome: number; totalExpense: number; balance: number }>
}
