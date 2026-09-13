<script lang="ts" setup>
import type { ActivityChain } from '~/types/activity'
import { ChainOutcome } from '~/types/activity'
import { ItemStatus, STATUS_LABEL } from '~/types/daily'
import { todayIso } from '~/utils/date'
import { lineColorVar } from '~/utils/lineColor'
import { pluralDays } from '~/utils/plural'

type Props = {
  days: string[]
  chains: ActivityChain[]
}

const { days, chains } = defineProps<Props>()

const ROW_HEIGHT_REM = 3
const ROW_AMPLITUDE_REM = 0.75

const today = todayIso()

const elapsedDays = computed(() => days.filter(day => day <= today))

const trackWidth = computed(() => `${(elapsedDays.value.length / Math.max(days.length, 1)) * 100}%`)

const rows = computed(() => [...chains].sort((a, b) => {
  return a.firstDate.localeCompare(b.firstDate) || a.chainId.localeCompare(b.chainId)
}))

const chainTitle = (chain: ActivityChain) => chain.title || 'Без названия'

const outcomeLabel = (chain: ActivityChain) => {
  if (chain.outcome === ChainOutcome.DONE) return STATUS_LABEL[ItemStatus.DONE]
  if (chain.outcome === ChainOutcome.DROPPED) return STATUS_LABEL[ItemStatus.DROPPED]

  return STATUS_LABEL[chain.lastStatus]
}

const chainMeta = (chain: ActivityChain) => {
  const parts = [outcomeLabel(chain), pluralDays(chain.daysTotal)]

  if (chain.blockedDays) parts.push(`в блоке ${chain.blockedDays}`)

  return parts.join(', ')
}
</script>

<template>
  <div
    class="activity-field"
    :style="{ '--columns': days.length, '--row-h': `${ROW_HEIGHT_REM}rem` }"
  >
    <div class="activity-field__canvas">
      <div class="activity-field__head">
        <span class="activity-field__corner" />
        <DailyAxis :days="days" />
      </div>

      <div class="activity-field__body">
        <div
          class="activity-field__backdrop"
          aria-hidden="true"
        >
          <DailyDayGrid :days="days.length" />
        </div>

        <ul class="activity-field__rows">
          <li
            v-for="chain in rows"
            :key="chain.chainId"
            class="activity-field__row"
            :style="{ '--line': lineColorVar(chain.chainId) }"
          >
            <div class="activity-field__name">
              <span
                class="activity-field__badge"
                aria-hidden="true"
              />
              <span class="activity-field__label">
                <span class="activity-field__title">{{ chainTitle(chain) }}</span>
                <span class="activity-field__meta num">{{ chainMeta(chain) }}</span>
              </span>
            </div>

            <div class="activity-field__track">
              <div
                v-if="elapsedDays.length"
                :style="{ width: trackWidth }"
              >
                <DailyRoute
                  :days="elapsedDays"
                  :history="chain.history"
                  :color="lineColorVar(chain.chainId)"
                  :title="chainTitle(chain)"
                  :height-rem="ROW_HEIGHT_REM"
                  :amplitude-rem="ROW_AMPLITUDE_REM"
                />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-field {
  --label-w: 13rem;
  --gap: var(--s-4);
  --column-min: 1.375rem;

  overflow-x: auto;
}

.activity-field__canvas {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  min-width: calc(var(--label-w) + var(--gap) + var(--columns) * var(--column-min));
}

.activity-field__head,
.activity-field__row {
  display: grid;
  grid-template-columns: var(--label-w) minmax(0, 1fr);
  gap: var(--gap);
}

.activity-field__body {
  position: relative;
}

.activity-field__backdrop {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--label-w) + var(--gap));
  right: 0;
}

.activity-field__rows {
  position: relative;
  display: flex;
  flex-direction: column;
}

.activity-field__row {
  align-items: center;
  height: var(--row-h);
}

.activity-field__name {
  position: sticky;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--s-2);
  height: 100%;
  min-width: 0;
  background: var(--surface);
}

.activity-field__badge {
  flex: none;
  width: 6px;
  height: 1.75rem;
  border-radius: var(--r-pill);
  background: var(--line);
}

.activity-field__label {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.activity-field__title,
.activity-field__meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-field__title {
  font-size: 0.875rem;
  line-height: 1.3;
  color: var(--ink);
}

.activity-field__meta {
  font-size: 0.75rem;
  line-height: 1.3;
  color: var(--ink-3);
}

.activity-field__track {
  min-width: 0;
}

@media (max-width: 48rem) {
  .activity-field {
    --label-w: 8.5rem;
    --gap: var(--s-3);
  }
}
</style>
