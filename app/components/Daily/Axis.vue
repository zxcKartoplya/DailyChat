<script lang="ts" setup>
import { formatDayNumber, formatWeekday, isWeekend, todayIso } from '~/utils/date'

type Props = {
  days: string[]
}

const { days } = defineProps<Props>()

const today = todayIso()
</script>

<template>
  <div
    class="axis"
    :style="{ '--axis-columns': days.length }"
  >
    <div
      v-for="day in days"
      :key="day"
      class="axis__day"
      :class="{
        'axis__day--today': day === today,
        'axis__day--weekend': isWeekend(day) && day !== today
      }"
    >
      <span class="axis__number num">{{ formatDayNumber(day) }}</span>
      <span class="axis__weekday">{{ formatWeekday(day) }}</span>
    </div>
  </div>
</template>

<style scoped>
.axis {
  display: grid;
  grid-template-columns: repeat(var(--axis-columns), 1fr);
  border-bottom: 1px solid var(--grid-strong);
}

.axis__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding-bottom: var(--s-1);
  color: var(--ink-2);
}

.axis__day--weekend {
  color: var(--ink-3);
}

.axis__day--today {
  color: var(--accent-text);
}

.axis__number {
  font-size: 0.75rem;
  line-height: 1;
}

.axis__day--today .axis__number {
  font-weight: 500;
}

.axis__weekday {
  font-size: 0.625rem;
  line-height: 1;
  letter-spacing: 0.02em;
}
</style>
