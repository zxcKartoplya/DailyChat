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
}

.axis__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  color: var(--ink-3);
}

.axis__day--weekend {
  color: var(--ink-3);
}

.axis__day--today {
  color: var(--ink);
}

.axis__number {
  font-size: 0.8125rem;
  line-height: 1.1;
}

.axis__day--today .axis__number {
  font-weight: 600;
}

.axis__weekday {
  font-size: 0.6875rem;
  line-height: 1.1;
}
</style>
