<script lang="ts" setup>
import { useOffReasonsStore } from '~/stores/offReasons'
import type { DailyEntry } from '~/types/daily'
import { DayType, EntryStatus, ItemStatus, STATUS_LABEL } from '~/types/daily'
import { formatDateRange, formatDayTitle, todayIso } from '~/utils/date'
import type { HistoryDay, HistoryRow, HistoryWeek } from '~/utils/historyTimeline'
import { WEEK_DAYS } from '~/utils/historyTimeline'
import { lineColorVar } from '~/utils/lineColor'

type Props = {
  week: HistoryWeek
}

const { week } = defineProps<Props>()

const reasons = useOffReasonsStore()

const today = todayIso()

const dates = computed(() => week.days.map(day => day.date))

const caption = computed(() => {
  const first = dates.value[0]
  const last = dates.value.at(-1)

  return first && last ? formatDateRange(first, last) : ''
})

const expanded = ref(new Set<string>())

const isOpen = (chainId: string) => expanded.value.has(chainId)

const toggle = (chainId: string) => {
  const next = new Set(expanded.value)

  if (next.has(chainId)) next.delete(chainId)
  else next.add(chainId)

  expanded.value = next
}

const chainTitle = (row: HistoryRow) => row.chain.title || 'Без названия'

const notesId = (row: HistoryRow) => `history-${week.key}-${row.chain.chainId}`

const isOff = (entry: DailyEntry | null) => entry?.dayType === DayType.OFF

const isDraft = (entry: DailyEntry | null) => entry?.status === EntryStatus.DRAFT

const hasOffDays = computed(() => week.days.some(day => isOff(day.entry)))

const offLabel = (entry: DailyEntry | null) => reasons.find(entry?.offReason ?? null)?.label ?? 'не работал'

const offTitle = (entry: DailyEntry | null) => {
  const note = entry?.offReasonNote?.trim()

  return note ? `${offLabel(entry)}: ${note}` : offLabel(entry)
}

const dayLink = (date: string) => date === today ? { path: '/' } : { path: '/', query: { date } }

const dayLabel = (day: HistoryDay) => {
  const parts = [`Открыть ${formatDayTitle(day.date)} на главной`]

  if (isOff(day.entry)) parts.push(`нерабочий день: ${offTitle(day.entry)}`)
  if (isDraft(day.entry)) parts.push('черновик, не отправлен')

  return parts.join('. ')
}

const markModifier = (status: ItemStatus) => {
  if (status === ItemStatus.BLOCKED) return 'history-week__mark--delayed'
  if (status === ItemStatus.DONE) return 'history-week__mark--terminus'
  if (status === ItemStatus.DROPPED) return 'history-week__mark--cut'

  return 'history-week__mark--stop'
}

const WEB_LINK = /^https?:\/\//i

const isWebLink = (link: string) => WEB_LINK.test(link)
</script>

<template>
  <section
    class="history-week panel"
    :style="{ '--span': week.days.length, '--lead': WEEK_DAYS - week.days.length, '--week': WEEK_DAYS }"
  >
    <h2 class="history-week__caption num">
      {{ caption }}
    </h2>

    <div class="history-week__scroll">
      <div class="history-week__canvas">
        <div class="history-week__head">
          <span class="history-week__corner" />
          <div class="history-week__lane">
            <div class="history-week__axis">
              <DailyAxis :days="dates" />

              <div class="history-week__day-links">
                <NuxtLink
                  v-for="day in week.days"
                  :key="day.date"
                  :to="dayLink(day.date)"
                  class="history-week__day-link"
                  :class="{ 'history-week__day-link--draft': isDraft(day.entry) }"
                  :aria-label="dayLabel(day)"
                  :title="isDraft(day.entry) ? 'черновик, не отправлен' : undefined"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="history-week__body">
          <div
            class="history-week__backdrop"
            aria-hidden="true"
          >
            <div class="history-week__lane history-week__lane--full">
              <div class="history-week__off-grid">
                <span
                  v-for="day in week.days"
                  :key="day.date"
                  :class="{ 'history-week__off-cell': isOff(day.entry) }"
                />
              </div>
              <DailyDayGrid :days="week.days.length" />
            </div>
          </div>

          <div
            v-if="hasOffDays"
            class="history-week__marks"
          >
            <span class="history-week__corner" />
            <div class="history-week__lane">
              <div class="history-week__off-labels">
                <span
                  v-for="day in week.days"
                  :key="day.date"
                  class="history-week__off-label"
                  :title="isOff(day.entry) ? offTitle(day.entry) : undefined"
                >{{ isOff(day.entry) ? offLabel(day.entry) : '' }}</span>
              </div>
            </div>
          </div>

          <p
            v-if="!week.rows.length"
            class="history-week__empty"
          >
            Линий в эти дни не было.
          </p>

          <ul
            v-else
            class="history-week__rows"
          >
            <li
              v-for="row in week.rows"
              :key="row.chain.chainId"
              class="history-week__row"
              :class="{ 'history-week__row--open': isOpen(row.chain.chainId) }"
              :style="{ '--line': lineColorVar(row.chain.chainId) }"
            >
              <div
                class="history-week__line"
                @click="toggle(row.chain.chainId)"
              >
                <button
                  type="button"
                  class="history-week__name"
                  :aria-expanded="isOpen(row.chain.chainId)"
                  :aria-controls="notesId(row)"
                >
                  <span
                    class="history-week__badge"
                    aria-hidden="true"
                  />
                  <span class="history-week__title">{{ chainTitle(row) }}</span>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="history-week__chevron"
                  />
                </button>

                <div class="history-week__lane">
                  <DailyRoute
                    :days="dates"
                    :history="row.chain.history"
                    :color="lineColorVar(row.chain.chainId)"
                    :title="chainTitle(row)"
                  />
                </div>
              </div>

              <div
                v-if="isOpen(row.chain.chainId)"
                :id="notesId(row)"
                class="history-week__notes"
              >
                <p
                  v-if="!row.notes.length"
                  class="history-week__notes-empty"
                >
                  В эти дни записей по линии не было.
                </p>

                <ol
                  v-else
                  class="history-week__note-list"
                >
                  <li
                    v-for="note in row.notes"
                    :key="note.id"
                    class="history-week__note"
                  >
                    <span
                      class="history-week__mark"
                      :class="markModifier(note.status)"
                      aria-hidden="true"
                    />
                    <span class="history-week__note-date">{{ formatDayTitle(note.date) }}</span>
                    <span class="history-week__note-body">
                      <span class="history-week__note-status">{{ STATUS_LABEL[note.status] }}</span>
                      <span
                        v-if="note.text"
                        class="history-week__note-text"
                      >{{ note.text }}</span>
                      <a
                        v-if="note.link && isWebLink(note.link)"
                        :href="note.link"
                        class="history-week__note-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >{{ note.link }}</a>
                      <span
                        v-else-if="note.link"
                        class="history-week__note-link history-week__note-link--plain"
                      >{{ note.link }}</span>
                    </span>
                  </li>
                </ol>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.history-week {
  --label-w: 13rem;
  --gap: var(--s-4);
  --column-min: 2.75rem;

  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding: var(--s-4) var(--s-5);
}

.history-week__caption {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-2);
}

.history-week__scroll {
  overflow-x: auto;
}

.history-week__canvas {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  min-width: calc(var(--label-w) + var(--gap) + var(--week) * var(--column-min));
}

.history-week__head,
.history-week__marks,
.history-week__line {
  display: grid;
  grid-template-columns: var(--label-w) minmax(0, 1fr);
  gap: var(--gap);
}

.history-week__lane {
  min-width: 0;
  margin-left: calc(var(--lead) / var(--week) * 100%);
}

.history-week__lane--full {
  height: 100%;
}

.history-week__axis {
  position: relative;
}

.history-week__day-links {
  position: absolute;
  inset: -2px 0;
  display: grid;
  grid-template-columns: repeat(var(--span), 1fr);
}

.history-week__day-link {
  position: relative;
  border-radius: var(--r-field);
  transition: background-color var(--t-state) var(--ease);
}

.history-week__day-link:hover {
  background: var(--surface-hover);
}

.history-week__day-link--draft::after {
  content: '';
  position: absolute;
  left: 30%;
  right: 30%;
  bottom: -3px;
  border-bottom: 2px dashed var(--ink-3);
}

.history-week__body {
  position: relative;
}

.history-week__backdrop {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--label-w) + var(--gap));
  right: 0;
}

.history-week__backdrop .history-week__lane {
  position: relative;
}

.history-week__off-grid,
.history-week__off-labels {
  display: grid;
  grid-template-columns: repeat(var(--span), 1fr);
}

.history-week__off-grid {
  position: absolute;
  inset: 0;
}

.history-week__off-cell {
  background: var(--surface-sunken);
}

.history-week__marks {
  position: relative;
  padding-top: var(--s-1);
}

.history-week__off-label {
  overflow: hidden;
  padding: 0 2px;
  font-size: 0.6875rem;
  line-height: 1.3;
  color: var(--ink-3);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-week__empty {
  position: relative;
  padding: var(--s-2) 0;
  font-size: 0.875rem;
  color: var(--ink-3);
}

.history-week__rows {
  position: relative;
  display: flex;
  flex-direction: column;
}

.history-week__line {
  align-items: center;
  cursor: pointer;
}

.history-week__name {
  position: sticky;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--s-2);
  min-width: 0;
  min-height: var(--ctrl-h-sm);
  padding: 0;
  background: var(--surface);
  border: 0;
  font: inherit;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}

.history-week__badge {
  flex: none;
  width: 6px;
  height: 1.75rem;
  border-radius: var(--r-pill);
  background: var(--line);
}

.history-week__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 0.875rem;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-week__chevron {
  flex: none;
  width: 1rem;
  height: 1rem;
  color: var(--ink-3);
  transition: transform var(--t-state) var(--ease), color var(--t-state) var(--ease);
}

.history-week__line:hover .history-week__chevron {
  color: var(--ink);
}

.history-week__row--open .history-week__chevron {
  transform: rotate(180deg);
}

.history-week__notes {
  position: sticky;
  left: 0;
  z-index: 1;
  max-width: calc(var(--content-max) - 2 * var(--s-5));
  margin: var(--s-1) 0 var(--s-3);
  padding: var(--s-3) var(--s-4);
  background: color-mix(in srgb, var(--line) 6%, var(--surface));
  border-radius: var(--r-field);
  animation: notes-open var(--t-open) var(--ease);
}

.history-week__notes-empty {
  font-size: 0.875rem;
  color: var(--ink-3);
}

.history-week__note-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.history-week__note {
  display: grid;
  grid-template-columns: 1.25rem 7.5rem minmax(0, 1fr);
  align-items: baseline;
  gap: var(--s-2);
}

.history-week__mark {
  justify-self: center;
  align-self: center;
  width: 13px;
  height: 13px;
  background: var(--surface);
  border: 3px solid var(--line);
  border-radius: 50%;
}

.history-week__mark--delayed {
  border-color: var(--alert);
  box-shadow: inset 0 0 0 2px var(--surface), inset 0 0 0 6px var(--alert);
}

.history-week__mark--terminus {
  width: 5px;
  height: 18px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--line);
}

.history-week__mark--cut {
  width: 9px;
  height: 9px;
  border: 0;
  background: var(--line);
}

.history-week__note-date {
  font-size: 0.8125rem;
  color: var(--ink-3);
}

.history-week__note-body {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px var(--s-2);
  min-width: 0;
}

.history-week__note-status {
  font-size: 0.75rem;
  color: var(--ink-2);
}

.history-week__note-text {
  color: var(--ink);
  max-width: 62ch;
}

.history-week__note-link {
  max-width: 100%;
  overflow: hidden;
  font-size: 0.8125rem;
  color: var(--accent-text);
  text-decoration: underline;
  text-overflow: ellipsis;
  text-underline-offset: 3px;
  white-space: nowrap;
}

.history-week__note-link--plain {
  color: var(--ink-2);
  text-decoration: none;
}

@keyframes notes-open {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 48rem) {
  .history-week {
    --label-w: 8.5rem;
    --gap: var(--s-3);

    padding: var(--s-4);
  }

  .history-week__note {
    grid-template-columns: 1.25rem minmax(0, 1fr);
  }

  .history-week__note-body {
    grid-column: 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .history-week__notes {
    animation: none;
  }
}
</style>
