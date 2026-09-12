<script lang="ts" setup>
import { useDailyStore } from '~/stores/daily'
import type { DraftItem } from '~/types/daily'
import { DayType } from '~/types/daily'
import { formatLongDate, lastDays, todayIso } from '~/utils/date'

definePageMeta({ layout: 'auth' })

const store = useDailyStore()
const toast = useToast()

const days = computed(() => lastDays(7, store.date))

const title = computed(() => `Дейлик за ${formatLongDate(store.date)}`)

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

const onSubmit = async () => {
  try {
    await store.submit()
    toast.add({ title: 'Дейлик отправлен', description: 'Сегодня его ещё можно править.' })
  } catch {
    toast.add({
      title: 'Не отправилось',
      description: 'Записи остались на экране. Попробуй ещё раз.',
      color: 'error'
    })
  }
}

const onMarkOff = async () => {
  await store.setDayType(store.isDayOff ? DayType.WORK : DayType.OFF)
}

const onFillMissing = (date: string) => store.load(date)

const onMissingOff = (dates: string[]) => store.markDaysOff(dates)

onMounted(() => {
  void store.load(todayIso())
})

useHead({ title: 'Дейлик' })
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
        v-for="line in 5"
        :key="line"
        class="daily__skeleton-line"
      />
    </div>

    <template v-else>
      <DailyMissingDays
        v-if="store.missingDays.length && store.isToday"
        :days="store.missingDays"
        :busy="store.saving"
        @fill="onFillMissing"
        @mark-off="onMissingOff"
      />

      <header class="daily__head">
        <div class="daily__heading">
          <h1 class="daily__title">
            {{ title }}
          </h1>
          <p
            v-if="!store.isToday"
            class="daily__note"
          >
            <button
              type="button"
              class="daily__back"
              @click="store.load(todayIso())"
            >
              вернуться к сегодняшнему дню
            </button>
          </p>
        </div>

        <button
          type="button"
          class="btn btn--ghost daily__off"
          :class="{ 'daily__off--on': store.isDayOff }"
          :aria-pressed="store.isDayOff"
          :disabled="!store.isEditable"
          @click="onMarkOff"
        >
          {{ store.isDayOff ? 'вернуть рабочий день' : 'не работал' }}
        </button>
      </header>

      <p
        v-if="store.isDayOff"
        class="daily__off-state"
      >
        День отмечен нерабочим. Пунктов в нём нет, линии останутся открытыми и придут завтра.
      </p>

      <template v-else>
        <section
          v-if="store.openChains.length"
          class="daily__section"
        >
          <div class="daily__section-head">
            <h2 class="daily__section-title">
              Продолжается
            </h2>
            <div class="daily__axis">
              <DailyAxis :days="days" />
            </div>
          </div>

          <div class="daily__axis daily__axis--mobile">
            <DailyAxis :days="days" />
          </div>

          <DailyChainRow
            v-for="chain in store.openChains"
            :key="chain.chainId"
            :chain="chain"
            :days="days"
            :editable="store.isEditable"
            :text="store.chainDraft(chain.chainId).text"
            :status="store.chainDraft(chain.chainId).status"
            @update:text="store.setChainText(chain.chainId, $event)"
            @update:status="store.setChainStatus(chain.chainId, $event)"
          />

          <DailyLegend />
        </section>

        <section class="daily__section">
          <div class="daily__section-head">
            <h2 class="daily__section-title">
              Новое
            </h2>
          </div>

          <DailyNewList
            v-model="newItemsModel"
            :editable="store.isEditable"
          />
        </section>
      </template>

      <footer class="daily__foot">
        <p class="daily__visibility">
          Это видит твой руководитель — и записи, и причины блокеров.
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
            <template v-else-if="store.saving">
              сохраняю…
            </template>
            <template v-else-if="store.isSubmitted">
              отправлен в <span class="num">{{ submittedTime }}</span>
            </template>
            <template v-else-if="store.savedAt">
              черновик сохранён
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
  --rail-w: 15.75rem;

  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  max-width: var(--content-max);
  padding-bottom: var(--s-7);
}

.daily__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding-top: var(--s-5);
}

.daily__skeleton-line {
  height: 1px;
  background: var(--grid);
  position: relative;
}

.daily__skeleton-line::after {
  content: '';
  position: absolute;
  inset-block: -1px;
  left: 0;
  width: 40%;
  background: var(--grid-strong);
  animation: skeleton 1.6s var(--ease) infinite;
}

.daily__skeleton-line:nth-child(2)::after {
  animation-delay: 120ms;
}

.daily__skeleton-line:nth-child(3)::after {
  animation-delay: 240ms;
}

.daily__skeleton-line:nth-child(4)::after {
  animation-delay: 360ms;
}

.daily__skeleton-line:nth-child(5)::after {
  animation-delay: 480ms;
}

@keyframes skeleton {
  0% {
    transform: translateX(-30%) scaleX(0.4);
    opacity: 0.4;
  }

  50% {
    transform: translateX(60%) scaleX(1);
    opacity: 1;
  }

  100% {
    transform: translateX(150%) scaleX(0.4);
    opacity: 0.4;
  }
}

.daily__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  padding-bottom: var(--s-3);
  border-bottom: 1px solid var(--grid-strong);
}

.daily__heading {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}

.daily__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.012em;
  color: var(--ink);
}

.daily__note {
  font-size: 0.8125rem;
  color: var(--ink-2);
}

.daily__back,
.daily__retry {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  color: var(--accent-text);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.daily__off--on {
  color: var(--ink);
  background: var(--surface-active);
}

.daily__off-state {
  padding: var(--s-4) 0;
  color: var(--ink-2);
  max-width: 62ch;
}

.daily__section {
  display: flex;
  flex-direction: column;
  padding-top: var(--s-4);
}

.daily__section-head {
  display: grid;
  grid-template-columns: 1fr var(--rail-w);
  align-items: end;
  gap: var(--s-5);
  padding-bottom: var(--s-2);
}

.daily__section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-2);
}

.daily__axis--mobile {
  display: none;
}

.daily__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  margin-top: var(--s-5);
  padding-top: var(--s-4);
  border-top: 1px solid var(--grid-strong);
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
  color: var(--signal);
}

@media (max-width: 60rem) {
  .daily__section-head {
    grid-template-columns: 1fr;
    gap: var(--s-2);
  }

  .daily__section-head .daily__axis {
    display: none;
  }

  .daily__axis--mobile {
    display: block;
    padding-bottom: var(--s-1);
  }
}

@media (max-width: 48rem) {
  .daily__foot {
    flex-direction: column;
    align-items: stretch;
  }

  .daily__actions {
    justify-content: space-between;
  }
}
</style>
