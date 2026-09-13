<script lang="ts" setup>
import type { DateValue } from '@internationalized/date'
import { parseDate } from '@internationalized/date'
import { formatDayTitle, shiftDays, todayIso } from '~/utils/date'

type Props = {
  date: string
}

const { date } = defineProps<Props>()

const emits = defineEmits<{
  select: [date: string]
}>()

const pickerOpen = ref(false)

const today = computed(() => todayIso())
const isToday = computed(() => date >= today.value)
const title = computed(() => formatDayTitle(date))
const calendarValue = computed(() => parseDate(date))
const maxValue = computed(() => parseDate(today.value))

const select = (target: string) => {
  if (target === date || target > today.value) return

  emits('select', target)
}

type CalendarPick = DateValue | DateValue[] | { start?: DateValue, end?: DateValue } | null | undefined

const pick = (value: CalendarPick) => {
  if (!value || Array.isArray(value) || 'start' in value) return

  pickerOpen.value = false
  select(value.toString())
}
</script>

<template>
  <div class="day-nav">
    <div class="day-nav__row">
      <div class="day-nav__steps">
        <button
          type="button"
          class="btn btn--ghost btn--sm day-nav__step"
          aria-label="Предыдущий день"
          @click="select(shiftDays(date, -1))"
        >
          <UIcon name="i-lucide-chevron-left" />
        </button>
        <button
          type="button"
          class="btn btn--ghost btn--sm day-nav__step"
          aria-label="Следующий день"
          :disabled="isToday"
          @click="select(shiftDays(date, 1))"
        >
          <UIcon name="i-lucide-chevron-right" />
        </button>
      </div>

      <h1 class="day-nav__title">
        <UPopover
          v-model:open="pickerOpen"
          :content="{ align: 'start' }"
        >
          <button
            type="button"
            class="day-nav__trigger"
          >
            <span>Дейлик за {{ title }}</span>
            <UIcon
              name="i-lucide-calendar-days"
              class="day-nav__trigger-icon"
            />
          </button>

          <template #content>
            <UCalendar
              class="p-2"
              locale="ru"
              :model-value="calendarValue"
              :max-value="maxValue"
              prevent-deselect
              @update:model-value="pick"
            />
          </template>
        </UPopover>
      </h1>
    </div>

    <button
      v-if="!isToday"
      type="button"
      class="day-nav__today"
      @click="select(today)"
    >
      к сегодня
    </button>
  </div>
</template>

<style scoped>
.day-nav {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}

.day-nav__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2) var(--s-3);
}

.day-nav__steps {
  display: flex;
  gap: var(--s-1);
}

.day-nav__step {
  width: var(--ctrl-h-sm);
  padding: 0;
}

.day-nav__title {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--ink);
}

.day-nav__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  padding: 0;
  background: none;
  border: 0;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.day-nav__trigger-icon {
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--ink-3);
  transition: color var(--t-state) var(--ease);
}

.day-nav__trigger:hover .day-nav__trigger-icon {
  color: var(--ink);
}

.day-nav__today {
  align-self: flex-start;
  padding: 0;
  background: none;
  border: 0;
  font: inherit;
  font-size: 0.8125rem;
  color: var(--accent-text);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 48rem) {
  .day-nav__title {
    font-size: 1.5rem;
  }
}
</style>
