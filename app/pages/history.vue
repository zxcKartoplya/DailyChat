<script lang="ts" setup>
import { useDailyApi } from '~/composables/api/useDailyApi'
import type { DailyEntry } from '~/types/daily'
import { DayType, STATUS_LABEL } from '~/types/daily'
import { formatLongDate, formatWeekday, relativeDayLabel } from '~/utils/date'

definePageMeta({ layout: 'auth' })
useHead({ title: 'История' })

const { getHistory } = useDailyApi()

const entries = ref<DailyEntry[]>([])
const loading = ref(true)

const submittedTime = (entry: DailyEntry) => {
  if (!entry.submittedAt) return ''

  return new Date(entry.submittedAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    entries.value = await getHistory()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="history">
    <header class="history__head">
      <h1 class="history__title">
        История
      </h1>
      <p class="history__lead">
        Отправленные дни. Прошлые записи закрыты на изменения.
      </p>
    </header>

    <p
      v-if="loading"
      class="history__loading"
      role="status"
    >
      Загружаем записи…
    </p>

    <p
      v-else-if="!entries.length"
      class="history__empty"
    >
      Записей пока нет. Первый отправленный дейлик появится здесь.
    </p>

    <ol
      v-else
      class="history__list"
    >
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="history__day"
      >
        <div class="history__day-head">
          <h2 class="history__date">
            <span class="num">{{ formatLongDate(entry.date) }}</span>
            <span class="history__weekday">{{ formatWeekday(entry.date) }}</span>
          </h2>
          <p class="history__stamp">
            {{ relativeDayLabel(entry.date) }}<template v-if="submittedTime(entry)">
              , отправлен в <span class="num">{{ submittedTime(entry) }}</span>
            </template>
          </p>
        </div>

        <p
          v-if="entry.dayType === DayType.OFF"
          class="history__off"
        >
          не работал
        </p>

        <ul
          v-else
          class="history__items"
        >
          <li
            v-for="item in entry.items"
            :key="item.id"
            class="history__item"
          >
            <span class="history__glyph">
              <DailyStatusGlyph :status="item.status" />
            </span>
            <span class="history__text">{{ item.text }}</span>
            <span class="history__status">{{ STATUS_LABEL[item.status] }}</span>
          </li>
        </ul>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  max-width: var(--content-max);
  padding-bottom: var(--s-7);
}

.history__head {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  padding-bottom: var(--s-3);
  border-bottom: 1px solid var(--grid-strong);
}

.history__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.012em;
}

.history__lead,
.history__loading,
.history__empty {
  color: var(--ink-2);
  font-size: 0.9375rem;
  max-width: 62ch;
}

.history__list {
  display: flex;
  flex-direction: column;
}

.history__day {
  padding: var(--s-4) 0;
  border-bottom: 1px solid var(--grid);
}

.history__day-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s-3);
  margin-bottom: var(--s-3);
}

.history__date {
  display: flex;
  align-items: baseline;
  gap: var(--s-2);
  font-size: 1rem;
  font-weight: 500;
  color: var(--ink);
}

.history__weekday {
  font-size: 0.75rem;
  color: var(--ink-3);
}

.history__stamp {
  font-size: 0.8125rem;
  color: var(--ink-3);
}

.history__off {
  color: var(--ink-3);
  font-size: 0.9375rem;
}

.history__items {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.history__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: var(--s-3);
}

.history__glyph {
  color: var(--ink-3);
  transform: translateY(2px);
}

.history__text {
  color: var(--ink);
  max-width: 68ch;
}

.history__status {
  font-size: 0.75rem;
  color: var(--ink-3);
}

@media (max-width: 48rem) {
  .history__item {
    grid-template-columns: auto 1fr;
  }

  .history__status {
    grid-column: 2;
  }
}
</style>
