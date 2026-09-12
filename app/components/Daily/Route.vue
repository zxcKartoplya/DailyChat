<script lang="ts" setup>
import type { ChainPoint } from '~/types/daily'
import { ItemStatus } from '~/types/daily'
import { formatLongDate } from '~/utils/date'

type Props = {
  days: string[]
  history: ChainPoint[]
  color: string
  todayStatus?: ItemStatus | null
  interactive?: boolean
  title?: string
}

const {
  days,
  history,
  color,
  todayStatus = null,
  interactive = false,
  title = ''
} = defineProps<Props>()

const emits = defineEmits<{
  toggleToday: []
}>()

const cellWidth = computed(() => 100 / days.length)
const center = (index: number) => (index + 0.5) * cellWidth.value

const todayIndex = computed(() => days.length - 1)

const stations = computed(() => {
  return history
    .filter(point => days.includes(point.date))
    .map(point => ({
      date: point.date,
      status: point.status,
      index: days.indexOf(point.date)
    }))
})

const startsBefore = computed(() => {
  const first = days[0]

  return Boolean(first && history.some(point => point.date < first))
})

const startIndex = computed(() => {
  if (startsBefore.value) return -0.5

  return stations.value[0]?.index ?? todayIndex.value
})

const lastPastIndex = computed(() => stations.value.at(-1)?.index ?? null)

const trackStart = computed(() => (startsBefore.value ? 0 : center(startIndex.value)))

const trackEnd = computed(() => {
  if (lastPastIndex.value !== null) return center(lastPastIndex.value)

  return trackStart.value
})

const hasTrack = computed(() => trackEnd.value > trackStart.value || startsBefore.value)

const extension = computed(() => {
  if (!todayStatus) return null

  const from = lastPastIndex.value === null ? trackStart.value : center(lastPastIndex.value)
  const to = center(todayIndex.value)

  if (to <= from) return null

  return { left: from, width: to - from }
})

const isClosed = computed(() => {
  return todayStatus === ItemStatus.DONE || todayStatus === ItemStatus.DROPPED
})

const stationModifier = (status: ItemStatus) => {
  if (status === ItemStatus.BLOCKED) return 'route__station--delayed'
  if (status === ItemStatus.DONE) return 'route__station--terminus'
  if (status === ItemStatus.DROPPED) return 'route__station--cut'

  return 'route__station--stop'
}

const lastDayLabel = computed(() => {
  const last = days.at(-1)

  return last ? formatLongDate(last) : ''
})

const todayLabel = computed(() => {
  if (todayStatus) return `Убрать отметку за ${lastDayLabel.value} по линии «${title}»`

  return `Отметить ${lastDayLabel.value} по линии «${title}»`
})

const stationTitle = (date: string) => formatLongDate(date)
</script>

<template>
  <div
    class="route"
    :style="{ '--line': color }"
    :class="{ 'route--closed': isClosed }"
  >
    <span
      v-if="hasTrack"
      class="route__track"
      :style="{ left: `${trackStart}%`, width: `${Math.max(trackEnd - trackStart, 0)}%` }"
    />

    <span
      v-if="extension"
      class="route__track route__track--today"
      :style="{ left: `${extension.left}%`, width: `${extension.width}%` }"
    />

    <span
      v-for="station in stations"
      :key="station.date"
      class="route__station"
      :class="stationModifier(station.status)"
      :style="{ left: `${center(station.index)}%` }"
      :title="stationTitle(station.date)"
    />

    <button
      v-if="interactive"
      type="button"
      class="route__today"
      :class="{
        'route__today--marked': todayStatus,
        'route__today--delayed': todayStatus === ItemStatus.BLOCKED,
        'route__today--terminus': todayStatus === ItemStatus.DONE,
        'route__today--cut': todayStatus === ItemStatus.DROPPED
      }"
      :style="{ left: `${center(todayIndex)}%` }"
      :aria-pressed="Boolean(todayStatus)"
      :aria-label="todayLabel"
      @click="emits('toggleToday')"
    >
      <span class="route__today-mark" />
    </button>

    <span
      v-else-if="todayStatus"
      class="route__station"
      :class="stationModifier(todayStatus)"
      :style="{ left: `${center(todayIndex)}%` }"
    />
  </div>
</template>

<style scoped>
.route {
  position: relative;
  height: 2.25rem;
  width: 100%;
}

.route__track {
  position: absolute;
  top: 50%;
  height: 6px;
  background: var(--line);
  border-radius: var(--r-pill);
  transform: translateY(-50%);
}

.route__track--today {
  transform-origin: left center;
  animation: track-extend var(--t-move) var(--ease);
}

@keyframes track-extend {
  from {
    transform: translateY(-50%) scaleX(0);
  }

  to {
    transform: translateY(-50%) scaleX(1);
  }
}

.route--closed .route__track {
  opacity: 0.55;
}

.route__station {
  position: absolute;
  top: 50%;
  width: 13px;
  height: 13px;
  background: var(--surface);
  border: 3px solid var(--line);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.route__station--delayed {
  width: 17px;
  height: 17px;
  border-color: var(--alert);
  box-shadow: inset 0 0 0 3px var(--surface), inset 0 0 0 7px var(--alert);
}

.route__station--terminus {
  width: 5px;
  height: 20px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--line);
}

.route__station--cut {
  width: 11px;
  height: 11px;
  background: var(--line);
  border: 0;
  opacity: 0.45;
}

.route__today {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  background: none;
  border: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.route__today:hover .route__today-mark {
  border-color: var(--line);
  transform: scale(1.06);
}

.route__today-mark {
  width: 19px;
  height: 19px;
  background: var(--surface);
  border: 2px dashed var(--ink-3);
  border-radius: 50%;
  transition: border-color var(--t-state) var(--ease), background-color var(--t-move) var(--ease), transform var(--t-state) var(--ease);
}

.route__today--marked .route__today-mark {
  border: 4px solid var(--line);
  background: var(--surface);
  animation: station-set var(--t-move) var(--ease);
}

.route__today--delayed .route__today-mark {
  border-color: var(--alert);
  box-shadow: inset 0 0 0 3px var(--surface), inset 0 0 0 8px var(--alert);
}

.route__today--terminus .route__today-mark {
  width: 6px;
  height: 24px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--line);
}

.route__today--cut .route__today-mark {
  border: 0;
  background: var(--line);
  opacity: 0.5;
  width: 13px;
  height: 13px;
}

@keyframes station-set {
  from {
    transform: scale(0.5);
  }

  to {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .route__today--marked .route__today-mark,
  .route__track--today {
    animation: none;
  }
}
</style>
