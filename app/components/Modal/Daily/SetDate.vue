<script lang="ts" setup>
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, today } from '@internationalized/date'

const date = defineModel<DateValue | null>('date', { default: () => today(getLocalTimeZone()) })
const isOpen = ref(false)

const onSelect = (value: unknown) => {
  date.value = value as DateValue
  isOpen.value = false
}

const formattedDate = computed(() => {
  if (!date.value) return 'Выберите дату'
  return date.value.toDate(getLocalTimeZone()).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})
</script>

<template>
  <UPopover v-model:open="isOpen">
    <UButton
      variant="outline"
      color="neutral"
      leading-icon="i-lucide-calendar"
      :label="formattedDate"
    />

    <template #content>
      <UCalendar
        v-model="(date as any)"
        locale="ru"
        :year-controls="false"
        @update:model-value="onSelect"
      />
    </template>
  </UPopover>
</template>

<style lang="scss" scoped>
</style>
