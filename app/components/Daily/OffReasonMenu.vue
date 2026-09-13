<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import { useOffReasonsStore } from '~/stores/offReasons'
import type { OffReason } from '~/types/daily'

type Props = {
  selected?: OffReason | null
  disabled?: boolean
}

const { selected = null, disabled = false } = defineProps<Props>()

const emits = defineEmits<{
  select: [reason: OffReason | null]
}>()

const reasons = useOffReasonsStore()

const retry = (event: Event) => {
  event.preventDefault()
  void reasons.load()
}

const items = computed<DropdownMenuItem[]>(() => {
  if (reasons.options.length) {
    return reasons.options.map<DropdownMenuItem>(option => ({
      label: option.label,
      type: 'checkbox',
      checked: option.code === selected,
      onSelect: () => emits('select', option.code)
    }))
  }

  const fallback: DropdownMenuItem[] = [
    { label: 'отметить без причины', onSelect: () => emits('select', null) }
  ]

  if (reasons.failed || reasons.loading) {
    fallback.push({
      label: reasons.loading ? 'загружаем причины' : 'повторить загрузку',
      icon: 'i-lucide-rotate-cw',
      loading: reasons.loading,
      disabled: reasons.loading,
      onSelect: retry
    })
  }

  return fallback
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :disabled="disabled"
    :content="{ align: 'end' }"
  >
    <slot />
  </UDropdownMenu>
</template>
