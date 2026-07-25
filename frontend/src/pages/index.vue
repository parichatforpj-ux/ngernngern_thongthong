<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'

const transactionStore = useTransactionStore()
const { transactions, isLoading, summary } = storeToRefs(transactionStore)

const formatAmount = (amount: number) => `฿${amount.toLocaleString()}`

const recentTransactions = computed(() => transactions.value.slice(0, 5))

onMounted(() => {
  transactionStore.fetchTransactions()
  transactionStore.fetchSummary()
})
</script>

<template>
  <div>
    <UiSectionHeader
      title="แดชบอร์ด"
      subtitle="ภาพรวมการเงินของคุณ"
    />

    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="4">
        <VCard color="success" variant="tonal" class="h-100">
          <VCardText class="d-flex flex-column">
            <div class="d-flex align-center mb-2">
              <VIcon icon="ri-arrow-up-circle-line" size="24" class="me-2" />
              <span class="text-subtitle-1">รายรับทั้งหมด</span>
            </div>
            <div class="text-h4 font-weight-bold mt-auto">
              {{ formatAmount(summary.totalIncome) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="4">
        <VCard color="error" variant="tonal" class="h-100">
          <VCardText class="d-flex flex-column">
            <div class="d-flex align-center mb-2">
              <VIcon icon="ri-arrow-down-circle-line" size="24" class="me-2" />
              <span class="text-subtitle-1">รายจ่ายทั้งหมด</span>
            </div>
            <div class="text-h4 font-weight-bold mt-auto">
              {{ formatAmount(summary.totalExpense) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" md="4">
        <VCard :color="summary.balance >= 0 ? 'info' : 'warning'" variant="tonal" class="h-100">
          <VCardText class="d-flex flex-column">
            <div class="d-flex align-center mb-2">
              <VIcon icon="ri-wallet-3-line" size="24" class="me-2" />
              <span class="text-subtitle-1">ยอดคงเหลือ</span>
            </div>
            <div class="text-h4 font-weight-bold mt-auto">
              {{ formatAmount(summary.balance) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Recent Transactions -->
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-history-line" class="me-2" />
        รายการล่าสุด
        <VSpacer />
        <VBtn
          variant="text"
          color="primary"
          :to="{ name: 'transaction-page' }"
        >
          ดูทั้งหมด
          <VIcon end icon="ri-arrow-right-line" />
        </VBtn>
      </VCardTitle>
      <VCardText>
        <VList v-if="recentTransactions.length">
          <VListItem
            v-for="item in recentTransactions"
            :key="item.id"
            :subtitle="`${item.category} - ${item.description}`"
          >
            <template #prepend>
              <VAvatar :color="item.type === 'income' ? 'success' : 'error'" variant="tonal">
                <VIcon
                  :icon="item.type === 'income' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"
                />
              </VAvatar>
            </template>
            <template #title>
              <div class="d-flex align-center">
                <span class="me-auto">{{ item.date }}</span>
                <span :class="item.type === 'income' ? 'text-success' : 'text-error'">
                  {{ item.type === 'income' ? '+' : '-' }}{{ formatAmount(item.amount) }}
                </span>
              </div>
            </template>
          </VListItem>
        </VList>
        <div v-else-if="isLoading" class="text-center py-4">
          <VProgressCircular indeterminate />
        </div>
        <div v-else class="text-center py-4 text-medium-emphasis">
          ยังไม่มีรายการ
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
