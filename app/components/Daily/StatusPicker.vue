<script lang="ts" setup>
import { ItemStatus, STATUS_LABEL, STATUS_ORDER } from '~/types/daily'

type Props = {
  disabled?: boolean
  label: string
}

const { disabled = false, label } = defineProps<Props>()
const status = defineModel<ItemStatus>({ default: ItemStatus.IN_PROGRESS })

const buttons = ref<HTMLButtonElement[]>([])

const move = (offset: number) => {
  const current = STATUS_ORDER.indexOf(status.value)
  const next = STATUS_ORDER[(current + offset + STATUS_ORDER.length) % STATUS_ORDER.length]

  if (!next) return

  status.value = next
  nextTick(() => buttons.value[STATUS_ORDER.indexOf(next)]?.focus())
}
</script>

<template>
  <div
    class="picker"
    role="radiogroup"
    :aria-label="label"
    @keydown.left.prevent="move(-1)"
    @keydown.right.prevent="move(1)"
  >
    <button
      v-for="(item, index) in STATUS_ORDER"
      :key="item"
      :ref="el => { if (el) buttons[index] = el as HTMLButtonElement }"
      type="button"
      role="radio"
      class="picker__option"
      :class="{
        'picker__option--active': status === item,
        'picker__option--blocked': status === item && item === ItemStatus.BLOCKED
      }"
      :aria-checked="status === item"
      :tabindex="status === item ? 0 : -1"
      :disabled="disabled"
      @click="status = item"
    >
      <DailyStatusGlyph :status="item" />
      <span>{{ STATUS_LABEL[item] }}</span>
    </button>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.picker__option {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  height: var(--ctrl-h-sm);
  padding: 0 var(--s-3);
  background: transparent;
  color: var(--ink-3);
  border: 1px solid var(--grid);
  border-radius: var(--r-1);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: color var(--t-state) var(--ease), border-color var(--t-state) var(--ease), background-color var(--t-state) var(--ease);
}

.picker__option:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--grid-strong);
  background: var(--surface-hover);
}

.picker__option--active {
  color: var(--ink);
  border-color: var(--ink-2);
  background: var(--surface);
}

.picker__option--blocked {
  color: var(--signal);
  border-color: var(--signal);
  background: var(--signal-weak);
}

.picker__option:disabled {
  opacity: 0.55;
  cursor: default;
}
</style>
