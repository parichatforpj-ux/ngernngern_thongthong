<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'
import type { CreateTransactionBody, Transaction, UpdateTransactionBody } from '@/models'

const transactionStore = useTransactionStore()
const { transactions, isLoading, error, summary } = storeToRefs(transactionStore)

const headers = [
  { title: 'วันที่', key: 'date' },
  { title: 'ประเภท', key: 'type' },
  { title: 'หมวดหมู่', key: 'category' },
  { title: 'รายละเอียด', key: 'description' },
  { title: 'จำนวน', key: 'amount', align: 'end' as const },
  { title: 'จัดการ', key: 'action', sortable: false, align: 'end' as const },
]

const incomeCategories = ['เงินเดือน', 'ค่าจ้าง', 'โบนัส', 'ดอกเบี้ย', 'เงินปันผล', 'รายได้อื่น']
const expenseCategories = ['อาหาร', 'เดินทาง', 'ที่พัก', 'ค่าไฟฟ้า', 'ค่าน้ำ', 'ค่าโทรศัพท์', 'ค่าอินเตอร์เน็ต', 'ค่าแรงงาน', 'อื่นๆ']

// Dialog state
const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const deletingTransaction = ref<Transaction | null>(null)

const form = ref<CreateTransactionBody & UpdateTransactionBody>({
  type: 'expense',
  amount: 0,
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
})

const categories = computed(() =>
  form.value.type === 'income' ? incomeCategories : expenseCategories,
)

function openCreate() {
  editingTransaction.value = null
  form.value = {
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  }
  dialog.value = true
}

function openEdit(transaction: Transaction) {
  editingTransaction.value = transaction
  form.value = {
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
  }
  dialog.value = true
}

function openDelete(transaction: Transaction) {
  deletingTransaction.value = transaction
  deleteDialog.value = true
}

async function onSubmit() {
  isSubmitting.value = true
  try {
    if (editingTransaction.value) {
      await transactionStore.updateTransaction(editingTransaction.value.id, form.value)
    }
    else {
      await transactionStore.createTransaction(form.value as CreateTransactionBody)
    }
    dialog.value = false
  }
  catch (e: any) {
    error.value = e.message
  }
  finally {
    isSubmitting.value = false
  }
}

async function onDelete() {
  if (!deletingTransaction.value) return
  try {
    await transactionStore.deleteTransaction(deletingTransaction.value.id)
    deleteDialog.value = false
  }
  catch (e: any) {
    error.value = e.message
  }
}

const typeColor = (type: string) => type === 'income' ? 'success' : 'error'
const typeLabel = (type: string) => type === 'income' ? 'รายรับ' : 'รายจ่าย'
const formatAmount = (amount: number) => `฿${amount.toLocaleString()}`

onMounted(() => {
  transactionStore.fetchTransactions()
  transactionStore.fetchSummary()
})
</script>

<template>
  <div>
    <UiSectionHeader
      title="รายรับรายจ่าย"
      subtitle="บันทึกและติดตามการเงินของคุณ"
    />

    <!-- Summary Cards -->
    <VRow class="mb-4">
      <VCol cols="12" md="4">
        <VCard color="success" variant="tonal">
          <VCardText>
            <div class="text-subtitle-1">รายรับทั้งหมด</div>
            <div class="text-h4 font-weight-bold">
              {{ formatAmount(summary.totalIncome) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard color="error" variant="tonal">
          <VCardText>
            <div class="text-subtitle-1">รายจ่ายทั้งหมด</div>
            <div class="text-h4 font-weight-bold">
              {{ formatAmount(summary.totalExpense) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard :color="summary.balance >= 0 ? 'info' : 'warning'" variant="tonal">
          <VCardText>
            <div class="text-subtitle-1">ยอดคงเหลือ</div>
            <div class="text-h4 font-weight-bold">
              {{ formatAmount(summary.balance) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Add Button -->
    <div class="d-flex justify-end mb-4">
      <VBtn color="primary" @click="openCreate">
        <VIcon start icon="ri-add-line" />
        เพิ่มรายการ
      </VBtn>
    </div>

    <!-- Data Table -->
    <VCard>
      <VCardText>
        <VDataTable
          :headers="headers"
          :items="transactions"
          :loading="isLoading"
          hover
        >
          <template #item.date="{ item }">
            {{ item.date }}
          </template>
          <template #item.type="{ item }">
            <VChip :color="typeColor(item.type)" size="small" variant="tonal">
              {{ typeLabel(item.type) }}
            </VChip>
          </template>
          <template #item.amount="{ item }">
            <span :class="item.type === 'income' ? 'text-success' : 'text-error'">
              {{ item.type === 'income' ? '+' : '-' }}{{ formatAmount(item.amount) }}
            </span>
          </template>
          <template #item.action="{ item }">
            <VBtn icon size="small" variant="text" color="primary" @click="openEdit(item)">
              <VIcon icon="ri-edit-line" />
            </VBtn>
            <VBtn icon size="small" variant="text" color="error" @click="openDelete(item)">
              <VIcon icon="ri-delete-bin-line" />
            </VBtn>
          </template>
        </VDataTable>
      </VCardText>
    </VCard>

    <!-- Create/Edit Dialog -->
    <VDialog v-model="dialog" max-width="500">
      <VCard>
        <VCardTitle>
          {{ editingTransaction ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่' }}
        </VCardTitle>
        <VCardText>
          <VForm @submit.prevent="onSubmit">
            <VSelect
              v-model="form.type"
              label="ประเภท"
              :items="[
                { title: 'รายรับ', value: 'income' },
                { title: 'รายจ่าย', value: 'expense' },
              ]"
              item-title="title"
              item-value="value"
              required
              class="mb-3"
            />
            <VTextField
              v-model.number="form.amount"
              label="จำนวนเงิน"
              type="number"
              required
              class="mb-3"
            />
            <VSelect
              v-model="form.category"
              label="หมวดหมู่"
              :items="categories"
              required
              class="mb-3"
            />
            <VTextField
              v-model="form.description"
              label="รายละเอียด"
              required
              class="mb-3"
            />
            <VTextField
              v-model="form.date"
              label="วันที่"
              type="date"
              required
              class="mb-3"
            />
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="dialog = false">
            ยกเลิก
          </VBtn>
          <VBtn color="primary" :loading="isSubmitting" @click="onSubmit">
            {{ editingTransaction ? 'บันทึก' : 'เพิ่ม' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard>
        <VCardTitle class="text-error">
          <VIcon icon="ri-error-warning-line" class="me-2" />
          ยืนยันการลบ
        </VCardTitle>
        <VCardText>
          คุณต้องการลบรายการ "{{ deletingTransaction?.description }}" จำนวน {{ formatAmount(deletingTransaction?.amount || 0) }} ใช่หรือไม่?
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="deleteDialog = false">
            ยกเลิก
          </VBtn>
          <VBtn color="error" @click="onDelete">
            ลบ
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
