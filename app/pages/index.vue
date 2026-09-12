<script lang="ts" setup>
import { useDailyStore } from '~/stores/daily'
import type { DraftItem } from '~/types/daily'
import { DayType } from '~/types/daily'
import { formatLongDate, lastDays, todayIso } from '~/utils/date'
import { plural } from '~/utils/plural'

definePageMeta({ layout: 'auth' })

const store = useDailyStore()
const toast = useToast()

const days = computed(() => lastDays(7, store.date))
const title = computed(() => `Дейлик за ${formatLongDate(store.date)}`)
const markedCount = computed(() => store.items.length)

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

const onMarkOff = () => store.setDayType(store.isDayOff ? DayType.WORK : DayType.OFF)

onMounted(() => {
  void store.load(todayIso())
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
        @fill="store.load($event)"
        @mark-off="store.markDaysOff($event)"
      />

      <header class="daily__head">
        <div class="daily__heading">
          <h1 class="daily__title">
            {{ title }}
          </h1>
          <button
            v-if="!store.isToday"
            type="button"
            class="daily__back"
            @click="store.load(todayIso())"
          >
            вернуться к сегодняшнему дню
          </button>
        </div>

        <button
          type="button"
          class="btn btn--ghost"
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
        class="daily__off-state panel"
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
              В пути
            </h2>
            <DailyLegend />
          </div>

          <p
            v-if="store.isEditable"
            class="daily__hint"
          >
            Тапни станцию за сегодня на тех линиях, где что-то было. Где не было — пропусти, линия придёт завтра.
          </p>

          <div class="daily__axis">
            <DailyAxis :days="days" />
          </div>

          <div class="daily__lines">
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

        <p
          v-if="!store.isEditable"
          class="daily__readonly"
        >
          Этот день закрыт на изменения — статусы прошлого не переписываются.
        </p>
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

.daily__heading {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}

.daily__title {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--ink);
}

.daily__back,
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

.daily__off--on {
  color: var(--ink);
  background: var(--surface-active);
}

.daily__off-state {
  padding: var(--s-4) var(--s-5);
  color: var(--ink-2);
  max-width: 62ch;
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

.daily__hint {
  font-size: 0.8125rem;
  color: var(--ink-3);
  max-width: 64ch;
}

.daily__section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-2);
}

.daily__axis {
  padding: 0 var(--s-5);
}

.daily__lines {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
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

  .daily__title {
    font-size: 1.5rem;
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
