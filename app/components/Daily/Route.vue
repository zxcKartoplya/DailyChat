<script lang="ts" setup>
import type { ChainPoint } from '~/types/daily'
import { ItemStatus } from '~/types/daily'
import { formatLongDate } from '~/utils/date'
import type { RouteLevel, RoutePiece } from '~/utils/routeGeometry'
import { buildRouteGeometry } from '~/utils/routeGeometry'

type Props = {
  days: string[]
  history: ChainPoint[]
  color: string
  todayStatus?: ItemStatus | null
  interactive?: boolean
  title?: string
  heightRem?: number
  amplitudeRem?: number
}

const {
  days,
  history,
  color,
  todayStatus = null,
  interactive = false,
  title = '',
  heightRem = 2.25,
  amplitudeRem = 0.5
} = defineProps<Props>()

const emits = defineEmits<{
  toggleToday: []
}>()

const cellWidth = computed(() => 100 / days.length)
const center = (x: number) => (x + 0.5) * cellWidth.value
const levelY = (level: RouteLevel) => 50 - level * (amplitudeRem / heightRem) * 100

const todayIndex = computed(() => days.length - 1)

const geometry = computed(() => buildRouteGeometry({
  days,
  history,
  lastDay: interactive || todayStatus ? todayStatus : undefined
}))

const stations = computed(() => {
  if (!interactive) return geometry.value.stations

  return geometry.value.stations.filter(station => station.x !== todayIndex.value)
})

const growFrom = computed(() => {
  if (!todayStatus) return null

  const previous = geometry.value.stations.filter(station => station.x < todayIndex.value).at(-1)

  return previous?.x ?? -0.5
})

const isGrowing = (piece: RoutePiece) => growFrom.value !== null && piece.from.x >= growFrom.value

const settledPieces = computed(() => geometry.value.pieces.filter(piece => !isGrowing(piece)))
const growingPieces = computed(() => geometry.value.pieces.filter(isGrowing))

const pieceKey = (piece: RoutePiece) => `${piece.from.x}:${piece.from.level}:${piece.to.x}:${piece.to.level}`

const pieceLine = (piece: RoutePiece) => ({
  x1: `${center(piece.from.x)}%`,
  y1: `${levelY(piece.from.level)}%`,
  x2: `${center(piece.to.x)}%`,
  y2: `${levelY(piece.to.level)}%`,
  class: ['route__track', { 'route__track--dashed': piece.stroke === 'dashed' }]
})

const markShift = computed(() => `0 ${-geometry.value.endLevel * amplitudeRem}rem`)

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
    :style="{ '--line': color, 'height': `${heightRem}rem` }"
    :class="{ 'route--closed': geometry.closed }"
  >
    <svg
      class="route__tracks"
      aria-hidden="true"
      focusable="false"
    >
      <line
        v-for="piece in settledPieces"
        :key="pieceKey(piece)"
        v-bind="pieceLine(piece)"
      />

      <g
        v-if="growingPieces.length"
        class="route__grow"
      >
        <line
          v-for="piece in growingPieces"
          :key="pieceKey(piece)"
          v-bind="pieceLine(piece)"
        />
      </g>
    </svg>

    <span
      v-for="station in stations"
      :key="station.date"
      class="route__station"
      :class="stationModifier(station.status)"
      :style="{ left: `${center(station.x)}%`, top: `${levelY(station.level)}%` }"
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
      <span
        class="route__today-mark"
        :style="{ translate: markShift }"
      />
    </button>
  </div>
</template>

<style scoped>
.route {
  position: relative;
  width: 100%;
}

.route__tracks {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.route__track {
  fill: none;
  stroke: var(--line);
  stroke-width: 6px;
  stroke-linecap: round;
}

.route__track--dashed {
  stroke-dasharray: 4 11;
}

.route__grow {
  transform-box: fill-box;
  transform-origin: left center;
  animation: route-grow var(--t-move) var(--ease);
}

@keyframes route-grow {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

.route--closed .route__tracks {
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
  width: 9px;
  height: 9px;
  background: var(--line);
  border: 0;
}

.route__station--cut::after,
.route__today--cut .route__today-mark::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 15px;
  height: 6px;
  background: var(--line);
  border-radius: var(--r-pill);
  transform-origin: left center;
  transform: translate(-3px, -3px) rotate(42deg);
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
  background: var(--surface-active);
}

.route__today-mark {
  position: relative;
  width: 19px;
  height: 19px;
  background: var(--surface);
  border: 2px dashed var(--ink-3);
  border-radius: 50%;
  transition: border-color var(--t-state) var(--ease), background-color var(--t-move) var(--ease);
}

.route__today--marked .route__today-mark {
  border: 2px solid var(--line);
  background: var(--line);
}

.route__today--delayed .route__today-mark {
  border: 4px solid var(--alert);
  background: var(--surface);
}

.route__today--terminus .route__today-mark {
  width: 6px;
  height: 24px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--line);
}

.route__today--cut .route__today-mark {
  width: 11px;
  height: 11px;
  border: 0;
  background: var(--line);
}

@media (prefers-reduced-motion: reduce) {
  .route__grow {
    animation: none;
  }
}
</style>
