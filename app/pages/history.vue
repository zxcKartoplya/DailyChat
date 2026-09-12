<script lang="ts" setup>
import { useDailyApi } from '~/composables/api/useDailyApi'
import type { DailyEntry } from '~/types/daily'
import { DayType, ItemStatus, STATUS_LABEL } from '~/types/daily'
import { formatLongDate, formatWeekday } from '~/utils/date'
import { lineColorVar } from '~/utils/lineColor'

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

const markModifier = (status: ItemStatus) => {
  if (status === ItemStatus.BLOCKED) return 'entry__mark--delayed'
  if (status === ItemStatus.DONE) return 'entry__mark--terminus'
  if (status === ItemStatus.DROPPED) return 'entry__mark--cut'

  return 'entry__mark--stop'
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
        Отправленные дни. Прошлые записи закрыты на изменения — статусы прошлого не переписываются.
      </p>
    </header>

    <div
      v-if="loading"
      class="history__skeleton"
      role="status"
      aria-label="Загружаем записи"
    >
      <span
        v-for="line in 2"
        :key="line"
        class="history__skeleton-card"
      />
    </div>

    <p
      v-else-if="!entries.length"
      class="history__empty panel"
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
      >
        <article class="entry panel">
          <header class="entry__head">
            <h2 class="entry__date">
              <span class="num">{{ formatLongDate(entry.date) }}</span>
              <span class="entry__weekday">{{ formatWeekday(entry.date) }}</span>
            </h2>
            <p
              v-if="submittedTime(entry)"
              class="entry__stamp"
            >
              отправлен в <span class="num">{{ submittedTime(entry) }}</span>
            </p>
          </header>

          <p
            v-if="entry.dayType === DayType.OFF"
            class="entry__off"
          >
            не работал
          </p>

          <ul
            v-else
            class="entry__items"
          >
            <li
              v-for="item in entry.items"
              :key="item.id"
              class="entry__item"
              :style="{ '--line': lineColorVar(item.chainId ?? String(item.id)) }"
            >
              <span
                class="entry__mark"
                :class="markModifier(item.status)"
                aria-hidden="true"
              />
              <span class="entry__text">{{ item.text }}</span>
              <span class="entry__status">{{ STATUS_LABEL[item.status] }}</span>
            </li>
          </ul>
        </article>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  max-width: var(--content-max);
  padding-bottom: var(--s-7);
}

.history__head {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}

.history__title {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.015em;
}

.history__lead {
  color: var(--ink-2);
  font-size: 0.9375rem;
  max-width: 62ch;
}

.history__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.history__skeleton-card {
  height: 8rem;
  background: linear-gradient(100deg, var(--surface-sunken) 30%, var(--surface) 50%, var(--surface-sunken) 70%);
  background-size: 300% 100%;
  border-radius: var(--r-panel);
  animation: skeleton 1.8s var(--ease) infinite;
}

@keyframes skeleton {
  from {
    background-position: 150% 0;
  }

  to {
    background-position: -50% 0;
  }
}

.history__empty {
  padding: var(--s-5);
  color: var(--ink-2);
}

.history__list {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.entry {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding: var(--s-4) var(--s-5);
}

.entry__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
}

.entry__date {
  display: flex;
  align-items: baseline;
  gap: var(--s-2);
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--ink);
}

.entry__weekday {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--ink-3);
}

.entry__stamp {
  font-size: 0.8125rem;
  color: var(--ink-3);
}

.entry__off {
  color: var(--ink-3);
}

.entry__items {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.entry__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-3);
}

.entry__mark {
  flex: none;
  width: 13px;
  height: 13px;
  background: var(--surface);
  border: 3px solid var(--line);
  border-radius: 50%;
}

.entry__mark--delayed {
  border-color: var(--alert);
  box-shadow: inset 0 0 0 2px var(--surface), inset 0 0 0 6px var(--alert);
}

.entry__mark--terminus {
  width: 5px;
  height: 18px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--line);
}

.entry__mark--cut {
  border: 0;
  background: var(--line);
  opacity: 0.5;
}

.entry__text {
  color: var(--ink);
  max-width: 66ch;
}

.entry__status {
  font-size: 0.75rem;
  color: var(--ink-3);
}

@media (max-width: 48rem) {
  .entry {
    padding: var(--s-4);
  }

  .entry__item {
    grid-template-columns: auto 1fr;
  }

  .entry__status {
    grid-column: 2;
  }
}
</style>
