import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../domain/entities/transaction'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'

export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async listTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll()
  }

  async getTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) throw new NotFoundError('Transaction')
    return transaction
  }

  async listByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    return this.transactionRepository.findByType(type)
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    this.validateInput(input)
    return this.transactionRepository.create(input)
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (input.amount !== undefined && input.amount <= 0) {
      throw new ValidationError('amount must be greater than 0')
    }
    const updated = await this.transactionRepository.update(id, input)
    if (!updated) throw new NotFoundError('Transaction')
    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    const deleted = await this.transactionRepository.delete(id)
    if (!deleted) throw new NotFoundError('Transaction')
  }

  async getSummary(): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    return this.transactionRepository.getSummary()
  }

  private validateInput(input: CreateTransactionInput): void {
    if (!['income', 'expense'].includes(input.type)) {
      throw new ValidationError("type must be 'income' or 'expense'")
    }
    if (input.amount <= 0) {
      throw new ValidationError('amount must be greater than 0')
    }
    if (!input.category?.trim()) {
      throw new ValidationError('category is required')
    }
    if (!input.date) {
      throw new ValidationError('date is required')
    }
  }
}
