<script lang="ts" setup>
import type { SwipeIntent } from '~/composables/useCardSwipe'
import type { OpenChain } from '~/types/daily'
import { ItemStatus, STATUS_HINT, STATUS_LABEL } from '~/types/daily'
import { relativeDayLabel } from '~/utils/date'
import { lineColorVar } from '~/utils/lineColor'
import { pluralDays } from '~/utils/plural'

type Props = {
  chain: OpenChain
  days: string[]
  marked?: boolean
  editable?: boolean
}

const { chain, days, marked = false, editable = true } = defineProps<Props>()

const text = defineModel<string>('text', { default: '' })
const status = defineModel<ItemStatus>('status', { default: ItemStatus.IN_PROGRESS })

const emits = defineEmits<{
  toggleMark: []
  markUnchanged: []
}>()

const color = computed(() => lineColorVar(chain.chainId))
const card = ref<HTMLElement | null>(null)
const noteOpen = ref(false)
const noteField = ref<HTMLTextAreaElement | null>(null)
const pills = ref<HTMLElement | null>(null)
const pendingBlocked = ref(false)
const pendingText = ref('')

let noteOpenBeforeSwipe = false

const shownStatus = computed(() => pendingBlocked.value ? ItemStatus.BLOCKED : status.value)

const needsReason = computed(() => {
  return status.value === ItemStatus.BLOCKED || status.value === ItemStatus.DROPPED
})

const showNote = computed(() => {
  return noteOpen.value || pendingBlocked.value || text.value.length > 0 || needsReason.value
})

const hint = computed(() => STATUS_HINT[shownStatus.value])

const cardLabel = computed(() => {
  if (!marked) return `Линия «${chain.title}», без отметки`

  return `Линия «${chain.title}», отмечена: ${STATUS_LABEL[status.value]}`
})

const openNote = async () => {
  noteOpen.value = true
  await nextTick()
  noteField.value?.focus()
}

const dropPending = () => {
  if (!pendingBlocked.value) return

  pendingBlocked.value = false
  pendingText.value = ''
  noteOpen.value = noteOpenBeforeSwipe
}

const onNoteBlur = (event: FocusEvent) => {
  if (event.relatedTarget instanceof Node && pills.value?.contains(event.relatedTarget)) return

  dropPending()
}

const isNewReason = (value: string) => {
  const reason = value.trim()

  return reason.length > 0 && reason !== text.value.trim()
}

const noteText = computed({
  get: () => pendingBlocked.value ? pendingText.value : text.value,
  set: (value: string) => {
    if (!pendingBlocked.value) {
      text.value = value

      return
    }

    pendingText.value = value

    if (!isNewReason(value)) return

    pendingBlocked.value = false
    status.value = ItemStatus.BLOCKED
    text.value = value
  }
})

const pillStatus = computed({
  get: () => shownStatus.value,
  set: (value: ItemStatus) => {
    dropPending()
    status.value = value
  }
})

const awaitReason = () => {
  if (marked && status.value === ItemStatus.BLOCKED) {
    void openNote()

    return
  }

  noteOpenBeforeSwipe = noteOpen.value
  pendingText.value = text.value
  pendingBlocked.value = true
  void openNote()
}

const applySwipe = (intent: SwipeIntent) => {
  dropPending()

  if (intent === ItemStatus.BLOCKED) {
    awaitReason()

    return
  }

  status.value = intent
}

const { offset, intent, dragging } = useCardSwipe(card, {
  enabled: () => editable,
  onCommit: applySwipe
})

const swipeLabel = computed(() => {
  const preview = intent.value ?? (offset.value < 0 ? ItemStatus.DONE : ItemStatus.IN_PROGRESS)

  return STATUS_LABEL[preview]
})

const swipeShift = computed(() => offset.value ? { transform: `translateX(${offset.value}px)` } : undefined)

const { resize } = useAutosize(noteField, () => noteText.value)

watch(() => marked, (value) => {
  if (value) return

  dropPending()
  noteOpen.value = false
})
</script>

<template>
  <article
    ref="card"
    data-card
    class="line"
    :class="{ 'line--marked': marked, 'line--swipeable': editable, 'line--dragging': dragging }"
    :style="{ '--line': color }"
    :tabindex="editable ? 0 : undefined"
    :aria-label="cardLabel"
    :aria-keyshortcuts="editable ? 'Space 1 2 3 4' : undefined"
  >
    <div
      v-if="editable"
      class="line__swipe"
      :class="{
        'line__swipe--end': offset < 0,
        'line__swipe--armed': intent,
        'line__swipe--blocked': intent === ItemStatus.BLOCKED
      }"
      aria-hidden="true"
    >
      {{ swipeLabel }}
    </div>

    <div
      class="line__body"
      :style="swipeShift"
    >
      <div class="line__band">
        <DailyDayGrid :days="days.length" />

        <div class="line__head">
          <span
            class="line__badge"
            aria-hidden="true"
          />

          <div class="line__heading">
            <h3 class="line__title">
              {{ chain.title }}
            </h3>
            <p class="line__meta">
              <span class="num line__age">{{ pluralDays(chain.daysOpen) }} в пути</span>
              <span class="line__last">{{ relativeDayLabel(chain.lastDate) }}: {{ chain.lastText }}</span>
            </p>
          </div>
        </div>

        <DailyRoute
          :days="days"
          :history="chain.history"
          :color="color"
          :today-status="marked ? status : null"
          :interactive="editable"
          :title="chain.title"
          @toggle-today="emits('toggleMark')"
        />
      </div>

      <div
        v-if="editable && (marked || pendingBlocked)"
        class="line__controls"
      >
        <div ref="pills">
          <DailyStatePills
            v-model="pillStatus"
            :label="`Состояние линии «${chain.title}»`"
          />
        </div>

        <button
          v-if="!showNote"
          type="button"
          class="line__note-open"
          @click="openNote"
        >
          добавить запись
        </button>

        <textarea
          v-else
          ref="noteField"
          v-model="noteText"
          class="field line__note"
          rows="1"
          :placeholder="hint"
          :aria-label="`Запись по линии «${chain.title}»`"
          @input="resize"
          @blur="onNoteBlur"
        />
      </div>

      <div
        v-else-if="editable"
        class="line__controls"
      >
        <button
          type="button"
          class="btn btn--secondary btn--sm line__unchanged"
          :aria-label="`Без изменений по линии «${chain.title}»`"
          @click="emits('markUnchanged')"
        >
          без изменений
        </button>
      </div>

      <div
        v-else-if="marked"
        class="line__readonly"
      >
        <span class="line__readonly-status">{{ STATUS_LABEL[status] }}</span>
        <p
          v-if="text"
          class="line__readonly-text"
        >
          {{ text }}
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.line {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--hairline);
}

.line:last-child {
  border-bottom: 0;
}

.line:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
  border-radius: var(--r-panel);
}

.line--swipeable {
  touch-action: pan-y pinch-zoom;
}

.line--dragging {
  user-select: none;
  -webkit-user-select: none;
}

.line__body {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-4) var(--s-5) var(--s-3);
  background: var(--surface);
  transition: background-color var(--t-state) var(--ease), transform var(--t-open) var(--ease);
}

.line--dragging .line__body {
  transition: background-color var(--t-state) var(--ease);
}

.line--marked .line__body {
  background: color-mix(in srgb, var(--line) 5%, var(--surface));
}

.line__swipe {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 var(--s-5);
  background: var(--surface-sunken);
  color: var(--ink-3);
  font-size: 0.875rem;
  font-weight: 600;
  transition: background-color var(--t-state) var(--ease), color var(--t-state) var(--ease);
}

.line__swipe--end {
  justify-content: flex-end;
}

.line__swipe--armed {
  background: color-mix(in srgb, var(--line) 18%, var(--surface));
  color: var(--ink);
}

.line__swipe--blocked {
  background: var(--alert-weak);
  color: var(--alert);
}

.line__band {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding-bottom: var(--s-1);
}

.line__head {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--s-3);
}

.line__badge {
  flex: none;
  width: 6px;
  height: 2.25rem;
  margin-top: 2px;
  background: var(--line);
  border-radius: var(--r-pill);
}

.line__heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.line__title {
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--ink);
  max-width: 44ch;
}

.line__meta {
  font-size: 0.8125rem;
  color: var(--ink-2);
  max-width: 68ch;
}

.line__age {
  color: var(--ink-3);
}

.line__age::after {
  content: ' · ';
  color: var(--ink-3);
}

.line__controls {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.line__unchanged {
  align-self: flex-start;
}

.line__note-open {
  align-self: flex-start;
  height: var(--ctrl-h-sm);
  padding: 0 var(--s-3);
  background: transparent;
  border: 0;
  border-radius: var(--r-pill);
  color: var(--accent-text);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color var(--t-state) var(--ease);
}

.line__note-open:hover {
  background: var(--accent-weak);
}

.line__note {
  resize: none;
  overflow: hidden;
  animation: note-open var(--t-open) var(--ease);
}

.line__readonly {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}

.line__readonly-status {
  font-size: 0.8125rem;
  color: var(--ink-2);
}

.line__readonly-text {
  color: var(--ink);
  max-width: 62ch;
}

@keyframes note-open {
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
  .line__body {
    padding: var(--s-4);
  }

  .line__swipe {
    padding: 0 var(--s-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .line__body {
    transition: background-color var(--t-state) var(--ease);
  }
}
</style>
