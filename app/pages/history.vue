<script lang="ts" setup>
import { useActivityApi } from '~/composables/api/useActivityApi'
import { useDailyApi } from '~/composables/api/useDailyApi'
import { useOffReasonsStore } from '~/stores/offReasons'
import type { EmployeeActivity } from '~/types/activity'
import { ActivityPeriod } from '~/types/activity'
import type { DailyEntry } from '~/types/daily'
import { daysBetween, formatDateRange, isIsoDate, shiftDays, todayIso } from '~/utils/date'
import { ApiError } from '~/utils/errors/ApiError'
import { buildHistoryWeeks } from '~/utils/historyTimeline'

definePageMeta({ layout: 'auth' })
useHead({ title: 'История' })

const route = useRoute()
const router = useRouter()
const { getActivity } = useActivityApi()
const { getHistory } = useDailyApi()
const offReasons = useOffReasonsStore()

const DEFAULT_PERIOD = ActivityPeriod.MONTH

const periodItems = [
  { label: 'Неделя', value: ActivityPeriod.WEEK },
  { label: 'Месяц', value: ActivityPeriod.MONTH }
]

const isPeriod = (value: unknown): value is ActivityPeriod => {
  return Object.values(ActivityPeriod).includes(value as ActivityPeriod)
}

const period = computed<ActivityPeriod>(() => {
  const value = route.query.period

  return isPeriod(value) ? value : DEFAULT_PERIOD
})

const endDate = computed<string | undefined>(() => {
  const value = route.query.date

  return isIsoDate(value) && value < todayIso() ? value : undefined
})

const selectPeriod = (value: string | number) => {
  if (!isPeriod(value) || value === period.value) return

  router.replace({
    query: {
      ...route.query,
      period: value === DEFAULT_PERIOD ? undefined : value
    }
  })
}

const goTo = (target: string) => {
  router.push({
    query: {
      ...route.query,
      date: target >= todayIso() ? undefined : target
    }
  })
}

const activity = ref<EmployeeActivity | null>(null)
const entries = ref<DailyEntry[]>([])
const loading = ref(true)
const error = ref('')

let requestId = 0

const load = async () => {
  requestId += 1
  const current = requestId

  loading.value = true
  error.value = ''

  try {
    const result = await getActivity(period.value, endDate.value)
    const list = await getHistory(result.dateFrom, result.dateTo)

    if (current !== requestId) return

    activity.value = result
    entries.value = list
  } catch (caught) {
    if (current !== requestId) return

    activity.value = null
    entries.value = []
    error.value = caught instanceof ApiError ? caught.message : 'Не удалось загрузить историю'
  } finally {
    if (current === requestId) loading.value = false
  }
}

const dropInvalidDate = () => {
  if (route.query.date === undefined || endDate.value !== undefined) return

  router.replace({ query: { ...route.query, date: undefined } })
}

onMounted(() => {
  void offReasons.load()
  dropInvalidDate()
  void load()
})

watch(() => route.query.date, dropInvalidDate)

watch([period, endDate], () => {
  void load()
})

const periodCaption = computed(() => {
  if (!activity.value) return ''

  return formatDateRange(activity.value.dateFrom, activity.value.dateTo)
})

const periodLength = computed(() => {
  if (!activity.value) return 0

  return daysBetween(activity.value.dateFrom, activity.value.dateTo) + 1
})

const isLatest = computed(() => !activity.value || activity.value.dateTo >= todayIso())

const goBack = () => {
  if (activity.value) goTo(shiftDays(activity.value.dateFrom, -1))
}

const goForward = () => {
  if (activity.value && !isLatest.value) goTo(shiftDays(activity.value.dateTo, periodLength.value))
}

const weeks = computed(() => {
  if (!activity.value) return []

  return buildHistoryWeeks({
    dateFrom: activity.value.dateFrom,
    dateTo: activity.value.dateTo,
    chains: activity.value.chains,
    entries: entries.value
  })
})

const isEmpty = computed(() => !entries.value.length && weeks.value.every(week => !week.rows.length))
</script>

<template>
  <div class="history">
    <header class="history__head">
      <div class="history__heading">
        <h1 class="history__title">
          История
        </h1>
        <p class="history__lead">
          Твои линии за период, по неделям. Строка раскрывает записи по дням, дата открывает день на главной.
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

    <div class="history__nav">
      <button
        type="button"
        class="btn btn--ghost btn--sm history__step"
        aria-label="Предыдущий период"
        :disabled="!activity"
        @click="goBack"
      >
        <UIcon name="i-lucide-chevron-left" />
      </button>
      <button
        type="button"
        class="btn btn--ghost btn--sm history__step"
        aria-label="Следующий период"
        :disabled="isLatest"
        @click="goForward"
      >
        <UIcon name="i-lucide-chevron-right" />
      </button>
      <p
        v-if="periodCaption"
        class="history__period num"
      >
        {{ periodCaption }}
      </p>
    </div>

    <div
      v-if="loading"
      class="history__skeleton"
      role="status"
      aria-label="Собираем линии за период"
    >
      <span
        v-for="strip in 2"
        :key="strip"
        class="history__skeleton-card"
      />
    </div>

    <section
      v-else-if="error"
      class="history__state panel"
      role="alert"
    >
      <p class="history__state-text">
        Не получилось собрать историю: {{ error }}
      </p>
      <button
        type="button"
        class="btn btn--secondary btn--sm"
        @click="load"
      >
        Повторить
      </button>
    </section>

    <p
      v-else-if="isEmpty"
      class="history__state panel history__state-text"
    >
      За период записей не было.
    </p>

    <DailyHistoryTimeline
      v-else
      :weeks="weeks"
    />
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
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--s-3) var(--s-5);
}

.history__heading {
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

.history__nav {
  display: flex;
  align-items: center;
  gap: var(--s-1) var(--s-3);
}

.history__step {
  width: var(--ctrl-h-sm);
  padding: 0;
}

.history__period {
  margin-left: var(--s-2);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-2);
}

.history__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.history__skeleton-card {
  height: 12rem;
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

.history__state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-3);
  padding: var(--s-5);
}

.history__state-text {
  color: var(--ink-2);
  max-width: 62ch;
}

@media (max-width: 48rem) {
  .history__title {
    font-size: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .history__skeleton-card {
    animation: none;
  }
}
</style>
