<script lang="ts" setup>
import type { HistoryWeek } from '~/utils/historyTimeline'

type Props = {
  weeks: HistoryWeek[]
}

const { weeks } = defineProps<Props>()
</script>

<template>
  <div class="history-timeline">
    <ol class="history-timeline__weeks">
      <li
        v-for="week in weeks"
        :key="week.key"
      >
        <DailyHistoryWeek :week="week" />
      </li>
    </ol>

    <div class="history-timeline__legend">
      <DailyLegend :today="false" />
      <p class="history-timeline__draft">
        <span
          class="history-timeline__draft-mark"
          aria-hidden="true"
        />
        черновик
      </p>
    </div>
  </div>
</template>

<style scoped>
.history-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
}

.history-timeline__weeks {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.history-timeline__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2) var(--s-5);
}

.history-timeline__draft {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-size: 0.75rem;
  color: var(--ink-3);
}

.history-timeline__draft-mark {
  width: 0.875rem;
  border-bottom: 2px dashed var(--ink-3);
}
</style>
