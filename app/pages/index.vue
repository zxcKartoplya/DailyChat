<script lang="ts" setup>
import { useDailyStore } from '~/stores/daily'
import { useOffReasonsStore } from '~/stores/offReasons'
import { UNDO_TTL, useUndoStore } from '~/stores/undo'
import type { DraftItem } from '~/types/daily'
import { ItemStatus, STATUS_LABEL, STATUS_ORDER } from '~/types/daily'
import { formatLongDate, isIsoDate, lastDays, todayIso } from '~/utils/date'
import { plural } from '~/utils/plural'
import { isSessionEnded } from '~/utils/session'

definePageMeta({ layout: 'auth' })

const store = useDailyStore()
const offReasons = useOffReasonsStore()
const undo = useUndoStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const pagePath = route.path

const days = computed(() => lastDays(7, store.date))
const markedCount = computed(() => store.items.length)

const hint = computed(() => {
  if (store.isToday) {
    return 'Отметь линии, где работа шла: станцией за сегодня или кнопкой «без изменений» — запись не обязательна. Где не было — пропусти, линия придёт завтра.'
  }

  return `Отметь линии, где работа шла: станцией за ${formatLongDate(store.date)} или кнопкой «без изменений» — запись не обязательна. Где не было — пропусти.`
})

const swipeHint = [
  `Смахни линию влево — ${STATUS_LABEL[ItemStatus.DONE]}`,
  `вправо — ${STATUS_LABEL[ItemStatus.IN_PROGRESS]}`,
  `дальше вправо — ${STATUS_LABEL[ItemStatus.BLOCKED]}, и напиши, что мешает.`
].join(', ')

const markAllLabel = computed(() => {
  return store.hasMarkedChains ? 'остальные без изменений' : 'ничего не изменилось'
})

const readonlyNote = computed(() => {
  if (!store.editableUntil) return 'Только просмотр'

  return `Только просмотр — этот день можно было править до ${formatLongDate(store.editableUntil)}`
})

const submittedNote = computed(() => {
  if (store.isToday) return 'Сегодня его ещё можно править.'
  if (!store.editableUntil) return undefined

  return `Его можно править до ${formatLongDate(store.editableUntil)}.`
})

const goTo = (target: string) => {
  void router.push({
    query: {
      ...route.query,
      date: target === todayIso() ? undefined : target
    }
  })
}

const openDay = async (target: string) => {
  const previous = store.date

  try {
    if (await store.open(target)) return
  } catch (caught) {
    if (isSessionEnded(caught)) return

    throw caught
  }

  toast.add({
    title: 'Не сохранилось',
    description: `Правки за ${formatLongDate(previous)} остались на этом устройстве. Открой тот день, чтобы сохранить их.`,
    color: 'error'
  })
}

const syncDay = () => {
  const requested = route.query.date
  const today = todayIso()

  if (requested === undefined) return openDay(today)

  if (!isIsoDate(requested) || requested >= today) {
    return router.replace({ query: { ...route.query, date: undefined } })
  }

  return openDay(requested)
}

watch(() => route.query.date, () => {
  if (route.path !== pagePath) return

  void syncDay()
})

const submittedTime = computed(() => {
  if (!store.submittedAt) return ''

  return new Date(store.submittedAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const newItemsModel = computed<DraftItem[]>({
  get: () => store.newItems,
  set: value => store.setNewItems(value)
})

const offReasonNoteModel = computed<string>({
  get: () => store.offReasonNote,
  set: value => store.setOffReasonNote(value)
})

const onSubmit = async () => {
  try {
    await store.submit()
    toast.add({ title: 'Дейлик отправлен', description: submittedNote.value })
  } catch (caught) {
    if (isSessionEnded(caught)) return

    toast.add({
      title: 'Не отправилось',
      description: 'Записи остались на экране. Попробуй ещё раз.',
      color: 'error'
    })
  }
}

const undoToastId = ref<string | number | null>(null)

watch(() => undo.offer, (offer) => {
  if (undoToastId.value !== null) toast.remove(undoToastId.value)

  undoToastId.value = offer
    ? toast.add({
      title: offer.title,
      duration: UNDO_TTL,
      actions: [{ label: 'отменить', onClick: () => undo.run() }]
    }).id
    : null
})

const chainAt = (index: number) => store.openChains[index] ?? null

const keyboard = useCardKeyboard({
  enabled: () => store.isEditable,
  onToggle: (index) => {
    const chain = chainAt(index)

    if (!chain) return

    store.toggleChainMark(chain.chainId)
  },
  onDigit: (index, position) => {
    const chain = chainAt(index)
    const status = STATUS_ORDER[position]

    if (!chain || !status) return

    store.setChainStatus(chain.chainId, status)
  },
  onSubmit: () => {
    if (!store.canSubmit || store.saving) return

    void onSubmit()
  },
  onUndo: () => undo.run()
})

onMounted(() => {
  void syncDay()
  void offReasons.load()
})
</script>

<template>
  <div class="daily">
    <div
      v-if="store.loading"
      class="daily__skeleton"
      role="status"
      aria-label="Загружаем день"
    >
      <span
        v-for="line in 3"
        :key="line"
        class="daily__skeleton-card"
      />
    </div>

    <template v-else>
      <DailyMissingDays
        v-if="store.missingDays.length && store.isToday"
        :days="store.missingDays"
        :busy="store.saving"
        @fill="goTo($event)"
        @mark-off="store.markDaysOff"
      />

      <header class="daily__head">
        <DailyDayNav
          :date="store.date"
          @select="goTo"
        />

        <button
          v-if="store.isDayOff"
          type="button"
          class="btn btn--secondary daily__off daily__off--on"
          aria-pressed="true"
          :disabled="!store.isEditable"
          @click="store.setWorkDay()"
        >
          вернуть рабочий день
        </button>
        <DailyOffReasonMenu
          v-else
          :disabled="!store.isEditable"
          @select="store.setDayOff($event)"
        >
          <button
            type="button"
            class="btn btn--secondary daily__off"
            :disabled="!store.isEditable"
          >
            не работал
          </button>
        </DailyOffReasonMenu>
      </header>

      <p
        v-if="!store.isEditable"
        class="daily__readonly"
      >
        {{ readonlyNote }}
      </p>

      <DailyOffDay
        v-if="store.isDayOff"
        v-model:note="offReasonNoteModel"
        :reason="store.offReason"
        :editable="store.isEditable"
        @select="store.setDayOff($event)"
      />

      <template v-else>
        <section
          v-if="store.openChains.length"
          class="daily__section"
        >
          <div class="daily__section-head">
            <div class="daily__section-lead">
              <h2 class="daily__section-title">
                В пути
              </h2>

              <button
                v-if="store.isEditable && store.hasUnmarkedChains"
                type="button"
                class="btn btn--secondary btn--sm"
                @click="store.markAllChainsUnchanged()"
              >
                {{ markAllLabel }}
              </button>
            </div>

            <DailyLegend />
          </div>

          <p
            v-if="store.isEditable"
            class="daily__hint"
          >
            {{ hint }}
          </p>

          <p
            v-if="store.isEditable"
            class="daily__swipe"
          >
            {{ swipeHint }}
          </p>

          <p
            v-if="store.isEditable"
            class="daily__keys"
          >
            <span class="daily__key">
              <kbd>↑</kbd><kbd>↓</kbd> линия
            </span>
            <span class="daily__key">
              <kbd>Space</kbd> отметить
            </span>
            <span class="daily__key">
              <kbd>1</kbd>—<kbd>4</kbd> состояние
            </span>
            <span class="daily__key">
              <kbd>Esc</kbd> выйти из записи
            </span>
            <span class="daily__key">
              <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd> отменить
            </span>
            <span class="daily__key">
              <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>↵</kbd> отправить
            </span>
          </p>

          <div class="daily__axis">
            <DailyAxis :days="days" />
          </div>

          <div
            class="daily__field panel"
            @keydown="keyboard.onKeydown"
          >
            <DailyLineCard
              v-for="chain in store.openChains"
              :key="chain.chainId"
              :chain="chain"
              :days="days"
              :marked="store.isChainTouched(chain.chainId)"
              :editable="store.isEditable"
              :text="store.chainDraft(chain.chainId).text"
              :status="store.chainDraft(chain.chainId).status"
              @update:text="store.setChainText(chain.chainId, $event)"
              @update:status="store.setChainStatus(chain.chainId, $event)"
              @toggle-mark="store.toggleChainMark(chain.chainId)"
              @mark-unchanged="store.markChainUnchanged(chain.chainId)"
            />
          </div>
        </section>

        <section
          v-if="store.isEditable || store.newItems.length"
          class="daily__section"
        >
          <div class="daily__section-head">
            <h2 class="daily__section-title">
              Новая ветка
            </h2>
          </div>

          <DailyNewBranch
            v-model="newItemsModel"
            :editable="store.isEditable"
          />
        </section>
      </template>

      <footer class="daily__foot">
        <p class="daily__visibility">
          Это видит твой руководитель — и записи, и причины задержек.
        </p>

        <div class="daily__actions">
          <p
            class="daily__state"
            role="status"
          >
            <template v-if="store.saveFailed">
              <span class="daily__state-failed">не сохранилось</span>
              <button
                type="button"
                class="daily__retry"
                @click="store.retrySave()"
              >
                повторить
              </button>
            </template>
            <template v-else-if="store.isSubmitted">
              <span>отправлен в</span>
              <span class="num">{{ submittedTime }}</span>
            </template>
            <template v-else-if="markedCount">
              {{ markedCount }} {{ plural(markedCount, ['пункт', 'пункта', 'пунктов']) }}
            </template>
          </p>

          <button
            v-if="store.isEditable"
            type="button"
            class="btn btn--primary"
            :disabled="!store.canSubmit || store.saving"
            @click="onSubmit"
          >
            {{ store.isSubmitted ? 'Сохранить правки' : 'Отправить' }}
          </button>
        </div>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.daily {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  max-width: var(--content-max);
  padding-bottom: var(--s-7);
}

.daily__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding-top: var(--s-5);
}

.daily__skeleton-card {
  height: 7.5rem;
  background: linear-gradient(100deg, var(--surface-sunken) 30%, var(--surface) 50%, var(--surface-sunken) 70%);
  background-size: 300% 100%;
  border-radius: var(--r-panel);
  animation: skeleton 1.8s var(--ease) infinite;
}

.daily__skeleton-card:nth-child(2) {
  animation-delay: 140ms;
}

.daily__skeleton-card:nth-child(3) {
  animation-delay: 280ms;
}

@keyframes skeleton {
  from {
    background-position: 150% 0;
  }

  to {
    background-position: -50% 0;
  }
}

.daily__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
}

.daily__retry {
  align-self: flex-start;
  padding: 0;
  background: none;
  border: 0;
  font: inherit;
  font-size: 0.8125rem;
  color: var(--accent-text);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.daily__off {
  align-self: flex-start;
}

.daily__off--on {
  color: var(--ink);
  background: var(--surface-active);
  border-color: var(--ink-3);
}

.daily__section {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding-top: var(--s-3);
}

.daily__section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3) var(--s-5);
}

.daily__section-lead {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3);
}

.daily__hint {
  font-size: 0.8125rem;
  color: var(--ink-3);
  max-width: 64ch;
}

.daily__swipe {
  display: none;
  font-size: 0.8125rem;
  color: var(--ink-3);
  max-width: 64ch;
}

@media (any-pointer: coarse) {
  .daily__swipe {
    display: block;
  }
}

.daily__keys {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2) var(--s-4);
  font-size: 0.75rem;
  color: var(--ink-3);
}

.daily__key {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
}

.daily__keys kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 var(--s-2);
  background: var(--surface-sunken);
  border-radius: var(--r-pill);
  color: var(--ink-2);
  font: inherit;
  font-size: 0.75rem;
}

@media (max-width: 48rem), (pointer: coarse) {
  .daily__keys {
    display: none;
  }
}

.daily__section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-2);
}

.daily__axis {
  padding: 0 var(--s-5);
}

.daily__field {
  position: relative;
  overflow: hidden;
}

.daily__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  margin-top: var(--s-4);
  padding-top: var(--s-4);
  border-top: 1px solid var(--hairline);
}

.daily__readonly {
  font-size: 0.875rem;
  color: var(--ink-3);
  max-width: 62ch;
}

.daily__visibility {
  font-size: 0.8125rem;
  color: var(--ink-2);
  max-width: 46ch;
}

.daily__actions {
  display: flex;
  align-items: center;
  gap: var(--s-4);
}

.daily__state {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-size: 0.8125rem;
  color: var(--ink-3);
  min-height: 1.2rem;
}

.daily__state-failed {
  color: var(--alert);
}

@media (max-width: 48rem) {
  .daily__axis {
    padding: 0 var(--s-4);
  }

  .daily__head {
    align-items: flex-start;
  }

  .daily__foot {
    flex-direction: column;
    align-items: stretch;
  }

  .daily__actions {
    justify-content: space-between;
  }
}
</style>
