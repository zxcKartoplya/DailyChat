<script lang="ts" setup>
import type { ChainPoint } from '~/types/daily'
import { ItemStatus } from '~/types/daily'
import { daysBetween } from '~/utils/date'

type Props = {
  days: string[]
  history: ChainPoint[]
  todayStatus?: ItemStatus | null
  pending?: boolean
}

const { days, history, todayStatus = null, pending = false } = defineProps<Props>()

const DAY = 36
const HEIGHT = 30
const CY = 15
const NODE_R = 3.4

const width = computed(() => days.length * DAY)
const x = (index: number) => index * DAY + DAY / 2

const startsBefore = computed(() => {
  const first = days[0]

  return Boolean(first && history.some(point => point.date < first))
})

const pastPoints = computed(() => {
  return history
    .filter(point => days.includes(point.date))
    .map(point => ({
      status: point.status,
      date: point.date,
      x: x(days.indexOf(point.date))
    }))
})

const todayX = computed(() => x(days.length - 1))

const hasTodayNode = computed(() => todayStatus !== null || pending)

const nodes = computed(() => {
  const list = pastPoints.value.map(point => ({ ...point, isToday: false }))

  if (hasTodayNode.value) {
    list.push({
      status: todayStatus ?? ItemStatus.IN_PROGRESS,
      date: days.at(-1) ?? '',
      x: todayX.value,
      isToday: true
    })
  }

  return list
})

const segments = computed(() => {
  const list: { from: number, to: number, silent: boolean, today: boolean }[] = []
  const points = pastPoints.value

  if (startsBefore.value && points[0]) {
    list.push({ from: 0, to: points[0].x, silent: false, today: false })
  }

  points.forEach((point, index) => {
    const next = points[index + 1]

    if (!next) return

    list.push({
      from: point.x,
      to: next.x,
      silent: daysBetween(point.date, next.date) > 1,
      today: false
    })
  })

  const last = points.at(-1)

  if (hasTodayNode.value && last && last.x < todayX.value) {
    list.push({
      from: last.x,
      to: todayX.value,
      silent: false,
      today: true
    })
  }

  if (hasTodayNode.value && !last && startsBefore.value) {
    list.push({ from: 0, to: todayX.value, silent: false, today: true })
  }

  return list
})

const endStatus = computed(() => {
  if (todayStatus) return todayStatus

  return pastPoints.value.at(-1)?.status ?? null
})

const isClosed = computed(() => {
  return endStatus.value === ItemStatus.DONE || endStatus.value === ItemStatus.DROPPED
})

const nodeClass = (status: ItemStatus, isToday: boolean) => {
  if (status === ItemStatus.BLOCKED) return 'thread__node--blocked'
  if (status === ItemStatus.DROPPED) return 'thread__node--dropped'
  if (isToday && !todayStatus) return 'thread__node--pending'

  return 'thread__node--open'
}
</script>

<template>
  <svg
    class="thread"
    :class="{ 'thread--closed': isClosed }"
    :viewBox="`0 0 ${width} ${HEIGHT}`"
    :width="width"
    :height="HEIGHT"
    role="img"
    :aria-label="`Линия работы за последние ${days.length} дней`"
  >
    <defs>
      <pattern
        id="thread-hatch"
        width="4"
        height="4"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="4"
          class="thread__hatch"
        />
      </pattern>
    </defs>

    <g class="thread__grid">
      <line
        v-for="(day, index) in days"
        :key="`grid-${day}`"
        :x1="index * DAY"
        y1="0"
        :x2="index * DAY"
        :y2="HEIGHT"
      />
      <line
        :x1="width"
        y1="0"
        :x2="width"
        :y2="HEIGHT"
      />
    </g>

    <g class="thread__line">
      <line
        v-for="(segment, index) in segments"
        :key="`segment-${index}`"
        :x1="segment.from"
        :y1="CY"
        :x2="segment.to"
        :y2="CY"
        :class="[
          segment.silent ? 'thread__segment--silent' : 'thread__segment--solid',
          segment.today ? 'thread__segment--today' : ''
        ]"
      />
    </g>

    <g
      v-for="node in nodes"
      :key="`node-${node.date}-${node.isToday}`"
    >
      <rect
        v-if="node.status === ItemStatus.BLOCKED"
        :x="node.x - 7"
        :y="CY - 9"
        width="14"
        height="18"
        fill="url(#thread-hatch)"
        class="thread__window"
      />
      <line
        v-if="node.status === ItemStatus.DONE"
        :x1="node.x"
        :y1="CY - 8"
        :x2="node.x"
        :y2="CY + 8"
        class="thread__terminal"
      />
      <circle
        v-else
        :cx="node.status === ItemStatus.DROPPED ? node.x - 4 : node.x"
        :cy="CY"
        :r="NODE_R"
        :class="['thread__node', nodeClass(node.status, node.isToday)]"
      />
    </g>
  </svg>
</template>

<style scoped>
.thread {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.thread__grid line {
  stroke: var(--grid);
  stroke-width: 1;
}

.thread__hatch {
  stroke: var(--signal);
  stroke-width: 1.4;
}

.thread__line line {
  stroke-width: 1.6;
  stroke-linecap: butt;
}

.thread__segment--solid {
  stroke: var(--ink-2);
}

.thread__segment--silent {
  stroke: var(--ink-3);
  stroke-dasharray: 2 3;
}

.thread__segment--today {
  stroke: var(--accent);
  animation: thread-draw var(--t-move) var(--ease);
}

.thread--closed .thread__segment--today {
  stroke: var(--ink-2);
}

.thread__node {
  stroke-width: 1.6;
}

.thread__node--open {
  fill: var(--ink-2);
  stroke: var(--ink-2);
}

.thread__node--blocked {
  fill: var(--signal);
  stroke: var(--signal);
}

.thread__node--dropped {
  fill: var(--ink-3);
  stroke: var(--ink-3);
}

.thread__node--pending {
  fill: var(--surface);
  stroke: var(--accent);
  animation: thread-node var(--t-move) var(--ease);
}

.thread__terminal {
  stroke: var(--ink);
  stroke-width: 2;
}

.thread__window {
  opacity: 0.9;
}

@keyframes thread-draw {
  from {
    opacity: 0;
    transform: scaleX(0.2);
    transform-origin: left center;
  }

  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes thread-node {
  from {
    r: 0;
  }

  to {
    r: 3.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .thread__segment--today,
  .thread__node--pending {
    animation: none;
  }
}
</style>
