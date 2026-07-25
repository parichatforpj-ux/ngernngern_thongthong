import { defineStore } from 'pinia'
import { transactionApi } from '@/apis/transaction-api'
import type { CreateTransactionBody, Transaction, UpdateTransactionBody } from '@/models'

export const useTransactionStore = defineStore('TransactionStore', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const summary = ref({ totalIncome: 0, totalExpense: 0, balance: 0 })

  async function fetchTransactions() {
    isLoading.value = true
    error.value = null
    try {
      const res = await transactionApi.list()
      transactions.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchSummary() {
    try {
      const res = await transactionApi.summary()
      summary.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
  }

  async function createTransaction(body: CreateTransactionBody) {
    const res = await transactionApi.create(body)
    transactions.value.unshift(res.data)
    await fetchSummary()
    return res.data
  }

  async function updateTransaction(id: string, body: UpdateTransactionBody) {
    const res = await transactionApi.update(id, body)
    const idx = transactions.value.findIndex(t => t.id === id)
    if (idx !== -1) transactions.value[idx] = res.data
    await fetchSummary()
    return res.data
  }

  async function deleteTransaction(id: string) {
    await transactionApi.remove(id)
    transactions.value = transactions.value.filter(t => t.id !== id)
    await fetchSummary()
  }

  return { transactions, isLoading, error, summary, fetchTransactions, fetchSummary, createTransaction, updateTransaction, deleteTransaction }
})
