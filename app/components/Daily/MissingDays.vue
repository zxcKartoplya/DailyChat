<script lang="ts" setup>
import { formatDateList } from '~/utils/date'

type Props = {
  days: string[]
  busy?: boolean
}

const { days, busy = false } = defineProps<Props>()

const emits = defineEmits<{
  fill: [date: string]
  markOff: [dates: string[]]
}>()

const label = computed(() => formatDateList(days))
const firstDay = computed(() => days[0] ?? '')
</script>

<template>
  <aside class="missing">
    <p class="missing__text">
      Не заполнено: <span class="missing__days">{{ label }}</span>
    </p>

    <div class="missing__actions">
      <button
        type="button"
        class="btn btn--secondary btn--sm"
        :disabled="busy"
        @click="emits('fill', firstDay)"
      >
        заполнить
      </button>
      <button
        type="button"
        class="btn btn--ghost btn--sm"
        :disabled="busy"
        @click="emits('markOff', days)"
      >
        не работал
      </button>
    </div>
  </aside>
</template>

<style scoped>
.missing {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-2) var(--s-2) var(--s-2) var(--s-4);
  background: var(--surface);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--r-pill);
}

.missing__text {
  font-size: 0.875rem;
  color: var(--ink-2);
}

.missing__days {
  color: var(--ink);
  font-weight: 500;
}

.missing__actions {
  display: flex;
  gap: var(--s-2);
}

@media (max-width: 48rem) {
  .missing {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--s-2);
    padding: var(--s-3) var(--s-4);
    border-radius: var(--r-panel);
  }
}
</style>
