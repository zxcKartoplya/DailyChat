<script lang="ts" setup>
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
}>()

const color = computed(() => lineColorVar(chain.chainId))
const noteOpen = ref(false)
const noteField = ref<HTMLTextAreaElement | null>(null)

const needsReason = computed(() => {
  return status.value === ItemStatus.BLOCKED || status.value === ItemStatus.DROPPED
})

const showNote = computed(() => noteOpen.value || text.value.length > 0 || needsReason.value)

const hint = computed(() => STATUS_HINT[status.value])

const openNote = async () => {
  noteOpen.value = true
  await nextTick()
  noteField.value?.focus()
}

const { resize } = useAutosize(noteField, () => text.value)

watch(() => marked, (value) => {
  if (!value) noteOpen.value = false
})
</script>

<template>
  <article
    class="line panel"
    :class="{ 'line--marked': marked }"
    :style="{ '--line': color }"
  >
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

    <div
      v-if="editable && marked"
      class="line__controls"
    >
      <DailyStatePills
        v-model="status"
        :label="`Состояние линии «${chain.title}»`"
      />

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
        v-model="text"
        class="field line__note"
        rows="1"
        :placeholder="hint"
        :aria-label="`Запись по линии «${chain.title}»`"
        @input="resize"
      />
    </div>

    <div
      v-else-if="!editable && marked"
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
  </article>
</template>

<style scoped>
.line {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-4) var(--s-5) var(--s-3);
  transition: border-color var(--t-state) var(--ease), background-color var(--t-state) var(--ease);
}

.line--marked {
  border-color: color-mix(in srgb, var(--line) 45%, var(--hairline));
}

.line__head {
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
  .line {
    padding: var(--s-4);
  }
}
</style>
