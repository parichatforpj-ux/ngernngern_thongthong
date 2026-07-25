import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

const transactions: Transaction[] = []

export class MemoryTransactionRepository implements TransactionRepository {
  async findAll(): Promise<Transaction[]> {
    return [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }

  async findById(id: string): Promise<Transaction | null> {
    return transactions.find(t => t.id === id) ?? null
  }

  async findByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    return transactions.filter(t => t.type === type).sort((a, b) => b.date.localeCompare(a.date))
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
    }
    transactions.push(transaction)
    return transaction
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = transactions.find(t => t.id === id)
    if (!existing) return null
    const updated: Transaction = {
      id: existing.id,
      type: input.type ?? existing.type,
      amount: input.amount ?? existing.amount,
      category: input.category ?? existing.category,
      description: input.description ?? existing.description,
      date: input.date ?? existing.date,
      createdAt: existing.createdAt,
    }
    const idx = transactions.findIndex(t => t.id === id)
    transactions[idx] = updated
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const idx = transactions.findIndex(t => t.id === id)
    if (idx === -1) return false
    transactions.splice(idx, 1)
    return true
  }

  async getSummary(): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
  }
}
