<script lang="ts" setup>
import { ItemStatus, STATUS_LABEL, STATUS_ORDER } from '~/types/daily'

type Props = {
  label: string
  disabled?: boolean
}

const { label, disabled = false } = defineProps<Props>()
const status = defineModel<ItemStatus>({ default: ItemStatus.IN_PROGRESS })

const buttons = ref<HTMLButtonElement[]>([])

const move = (offset: number) => {
  const current = STATUS_ORDER.indexOf(status.value)
  const next = STATUS_ORDER[(current + offset + STATUS_ORDER.length) % STATUS_ORDER.length]

  if (!next) return

  status.value = next
  nextTick(() => buttons.value[STATUS_ORDER.indexOf(next)]?.focus())
}

const modifier = (item: ItemStatus) => `pill--${item.replace('_', '-')}`
</script>

<template>
  <div
    class="pills"
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
      class="pill"
      :class="[modifier(item), { 'pill--active': status === item }]"
      :aria-checked="status === item"
      :tabindex="status === item ? 0 : -1"
      :disabled="disabled"
      @click="status = item"
    >
      <span class="pill__mark" />
      <span>{{ STATUS_LABEL[item] }}</span>
    </button>
  </div>
</template>

<style scoped>
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  height: var(--ctrl-h-sm);
  padding: 0 var(--s-4);
  background: var(--surface);
  color: var(--ink-2);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--r-pill);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color var(--t-state) var(--ease), border-color var(--t-state) var(--ease), background-color var(--t-state) var(--ease);
}

.pill:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--ink-3);
}

.pill:disabled {
  opacity: 0.5;
  cursor: default;
}

.pill__mark {
  width: 11px;
  height: 11px;
  border: 3px solid var(--ink-3);
  border-radius: 50%;
  transition: border-color var(--t-state) var(--ease), background-color var(--t-state) var(--ease);
}

.pill--done .pill__mark {
  width: 4px;
  height: 14px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--ink-3);
}

.pill--dropped .pill__mark {
  border: 0;
  background: var(--ink-3);
  opacity: 0.6;
}

.pill--active {
  color: var(--ink);
  border-color: var(--line, var(--accent));
  background: color-mix(in srgb, var(--line, var(--accent)) 12%, var(--surface));
}

.pill--active .pill__mark {
  border-color: var(--line, var(--accent));
}

.pill--done.pill--active .pill__mark,
.pill--dropped.pill--active .pill__mark {
  background: var(--line, var(--accent));
}

.pill--blocked.pill--active {
  border-color: var(--alert);
  background: var(--alert-weak);
}

.pill--blocked.pill--active .pill__mark {
  border-color: var(--alert);
}

@media (max-width: 30rem) {
  .pills {
    gap: var(--s-1);
  }

  .pill {
    padding: 0 var(--s-3);
    font-size: 0.8125rem;
  }
}
</style>
