<script lang="ts" setup>
import { useActivityApi } from '~/composables/api/useActivityApi'
import type { EmployeeActivity } from '~/types/activity'
import { ActivityPeriod } from '~/types/activity'
import { daysRange, formatDateRange } from '~/utils/date'
import { ApiError } from '~/utils/errors/ApiError'
import { plural } from '~/utils/plural'
import { isSessionEnded } from '~/utils/session'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Аналитика' })

const route = useRoute()
const router = useRouter()
const { getActivity } = useActivityApi()

const periodItems = [
  { label: 'Неделя', value: ActivityPeriod.WEEK },
  { label: 'Месяц', value: ActivityPeriod.MONTH }
]

const isPeriod = (value: unknown): value is ActivityPeriod => {
  return Object.values(ActivityPeriod).includes(value as ActivityPeriod)
}

const period = computed<ActivityPeriod>(() => {
  const value = route.query.period

  return isPeriod(value) ? value : ActivityPeriod.WEEK
})

const selectPeriod = (value: string | number) => {
  if (!isPeriod(value) || value === period.value) return

  router.replace({
    query: {
      ...route.query,
      period: value === ActivityPeriod.WEEK ? undefined : value
    }
  })
}

const activity = ref<EmployeeActivity | null>(null)
const loading = ref(true)
const error = ref('')

let requestId = 0

const load = async () => {
  requestId += 1
  const current = requestId

  loading.value = true
  error.value = ''

  try {
    const result = await getActivity(period.value)

    if (current !== requestId) return

    activity.value = result
  } catch (caught) {
    if (current !== requestId || isSessionEnded(caught)) return

    activity.value = null
    error.value = caught instanceof ApiError ? caught.message : 'Не удалось загрузить активность'
  } finally {
    if (current === requestId) loading.value = false
  }
}

onMounted(load)
watch(period, load)

const days = computed(() => activity.value ? daysRange(activity.value.dateFrom, activity.value.dateTo) : [])

const periodCaption = computed(() => {
  if (!activity.value) return ''

  return formatDateRange(activity.value.dateFrom, activity.value.dateTo)
})

const averageFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

const summaryItems = computed(() => {
  const summary = activity.value?.summary

  if (!summary) return []

  return [
    { key: 'started', value: String(summary.startedCount), label: 'заведено', alert: false },
    { key: 'done', value: String(summary.doneCount), label: 'доведено', alert: false },
    { key: 'dropped', value: String(summary.droppedCount), label: 'брошено', alert: false },
    { key: 'open', value: String(summary.openCount), label: 'открыто', alert: false },
    {
      key: 'blocked-chains',
      value: String(summary.blockedChainsCount),
      label: plural(summary.blockedChainsCount, ['линия в блоке', 'линии в блоке', 'линий в блоке']),
      alert: summary.blockedChainsCount > 0
    },
    {
      key: 'blocked-days',
      value: String(summary.blockedDays),
      label: plural(summary.blockedDays, ['день простоя', 'дня простоя', 'дней простоя']),
      alert: summary.blockedDays > 0
    },
    {
      key: 'avg-done',
      value: summary.avgDaysToDone === null ? '—' : averageFormat.format(summary.avgDaysToDone),
      label: 'дней до «готово» в среднем',
      alert: false
    }
  ]
})
</script>

<template>
  <div class="analytics">
    <header class="analytics__head">
      <div class="analytics__heading">
        <h1 class="analytics__title">
          Аналитика
        </h1>
        <p class="analytics__lead">
          Только твои линии и только то, что считается из записей. Оценок здесь нет.
        </p>
      </div>

      <UTabs
        :items="periodItems"
        :model-value="period"
        :content="false"
        color="neutral"
        aria-label="Период"
        :ui="{
          root: 'w-auto',
          list: 'w-auto rounded-full',
          indicator: 'rounded-full shadow-none',
          trigger: 'rounded-full px-4'
        }"
        @update:model-value="selectPeriod"
      />
    </header>

    <div
      v-if="loading"
      class="analytics__skeleton"
      role="status"
      aria-label="Собираем линии за период"
    />

    <section
      v-else-if="error"
      class="analytics__state panel"
      role="alert"
    >
      <p class="analytics__state-text">
        Не получилось собрать линии: {{ error }}
      </p>
      <button
        type="button"
        class="btn btn--secondary btn--sm"
        @click="load"
      >
        Повторить
      </button>
    </section>

    <section
      v-else-if="activity && !activity.chains.length"
      class="analytics__state panel"
    >
      <p class="analytics__period num">
        {{ periodCaption }}
      </p>
      <p class="analytics__state-text">
        За период линий не было.
      </p>
    </section>

    <section
      v-else-if="activity"
      class="analytics__map panel"
    >
      <header class="analytics__map-head">
        <p class="analytics__period">
          <span class="num">{{ periodCaption }}</span>
          <span class="analytics__period-count num">
            {{ activity.summary.chainsCount }}
            {{ plural(activity.summary.chainsCount, ['линия', 'линии', 'линий']) }}
          </span>
        </p>

        <dl class="analytics__summary">
          <div
            v-for="item in summaryItems"
            :key="item.key"
            class="analytics__stat"
          >
            <dt class="analytics__stat-label">
              {{ item.label }}
            </dt>
            <dd
              class="analytics__stat-value num"
              :class="{ 'analytics__stat-value--alert': item.alert }"
            >
              {{ item.value }}
            </dd>
          </div>
        </dl>
      </header>

      <DailyActivityField
        :days="days"
        :chains="activity.chains"
      />

      <DailyLegend :today="false" />
    </section>
  </div>
</template>

<style scoped>
.analytics {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  max-width: var(--content-max);
  padding-bottom: var(--s-7);
}

.analytics__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--s-3) var(--s-5);
}

.analytics__heading {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}

.analytics__title {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.015em;
}

.analytics__lead {
  color: var(--ink-2);
  font-size: 0.9375rem;
  max-width: 62ch;
}

.analytics__skeleton {
  height: 18rem;
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

.analytics__state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-3);
  padding: var(--s-5);
}

.analytics__state-text {
  color: var(--ink-2);
  max-width: 62ch;
}

.analytics__map {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-4) var(--s-5) var(--s-4);
}

.analytics__map-head {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding-bottom: var(--s-4);
  border-bottom: 1px solid var(--hairline);
}

.analytics__period {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s-1) var(--s-3);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-2);
}

.analytics__period-count {
  font-weight: 400;
  font-size: 0.8125rem;
  color: var(--ink-3);
}

.analytics__summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-3) var(--s-5);
}

.analytics__stat {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  min-width: 4.5rem;
}

.analytics__stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.012em;
  line-height: 1.1;
  color: var(--ink);
}

.analytics__stat-value--alert {
  color: var(--alert);
}

.analytics__stat-label {
  font-size: 0.75rem;
  line-height: 1.3;
  color: var(--ink-3);
  max-width: 11ch;
}

@media (max-width: 48rem) {
  .analytics__title {
    font-size: 1.5rem;
  }

  .analytics__map {
    padding: var(--s-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .analytics__skeleton {
    animation: none;
  }
}
</style>
