<script lang="ts" setup>
import { useDailyApi } from '~/composables/api/useDailyApi'
import type { OpenChain } from '~/types/daily'
import { ItemStatus } from '~/types/daily'
import { lastDays, todayIso } from '~/utils/date'
import { plural, pluralDays } from '~/utils/plural'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Аналитика' })

const { getDay } = useDailyApi()

const chains = ref<OpenChain[]>([])
const loading = ref(true)

const days = computed(() => lastDays(14))

const blocked = computed(() => chains.value.filter(chain => chain.lastStatus === ItemStatus.BLOCKED))

const longestSilence = computed(() => {
  return chains.value.reduce((max, chain) => Math.max(max, chain.daysOpen), 0)
})

onMounted(async () => {
  try {
    const day = await getDay(todayIso())
    chains.value = day.openChains
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="analytics">
    <header class="analytics__head">
      <h1 class="analytics__title">
        Аналитика
      </h1>
      <p class="analytics__lead">
        Только твои линии и только то, что считается из записей. Оценок здесь нет.
      </p>
    </header>

    <p
      v-if="loading"
      class="analytics__loading"
      role="status"
    >
      Считаем линии…
    </p>

    <template v-else>
      <p class="analytics__summary">
        Открыто <span class="num">{{ chains.length }}</span>
        {{ plural(chains.length, ['линия', 'линии', 'линий']) }},
        из них <span class="num">{{ blocked.length }}</span>
        {{ plural(blocked.length, ['стоит', 'стоят', 'стоят']) }} в блокере.
        Самая давняя открыта <span class="num">{{ pluralDays(longestSilence) }}</span>.
      </p>

      <section class="analytics__chart">
        <div class="analytics__axis">
          <DailyAxis :days="days" />
        </div>

        <ul class="analytics__rows">
          <li
            v-for="chain in chains"
            :key="chain.chainId"
            class="analytics__row"
          >
            <span class="analytics__name">{{ chain.title }}</span>
            <span class="analytics__thread">
              <DailyThread
                :days="days"
                :history="chain.history"
              />
            </span>
          </li>
        </ul>

        <DailyLegend />
      </section>

      <section
        v-if="blocked.length"
        class="analytics__blockers"
      >
        <h2 class="analytics__section-title">
          Что мешает прямо сейчас
        </h2>
        <ul class="analytics__blocker-list">
          <li
            v-for="chain in blocked"
            :key="chain.chainId"
            class="analytics__blocker"
          >
            <span class="analytics__blocker-text">{{ chain.lastText }}</span>
            <span class="analytics__blocker-meta num">{{ pluralDays(chain.daysOpen) }}</span>
          </li>
        </ul>
      </section>
    </template>
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
  flex-direction: column;
  gap: var(--s-1);
  padding-bottom: var(--s-3);
  border-bottom: 1px solid var(--grid-strong);
}

.analytics__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.012em;
}

.analytics__lead,
.analytics__loading {
  color: var(--ink-2);
  font-size: 0.9375rem;
  max-width: 62ch;
}

.analytics__summary {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--ink);
  max-width: 54ch;
}

.analytics__summary .num {
  font-size: 1.25rem;
  color: var(--accent-text);
}

.analytics__chart {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.analytics__axis {
  margin-left: auto;
  width: min(100%, 31.5rem);
}

.analytics__rows {
  display: flex;
  flex-direction: column;
}

.analytics__row {
  display: grid;
  grid-template-columns: 1fr min(60%, 31.5rem);
  align-items: center;
  gap: var(--s-4);
  padding: var(--s-2) 0;
  border-bottom: 1px solid var(--grid);
}

.analytics__name {
  font-size: 0.9375rem;
  color: var(--ink);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.analytics__section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-2);
  margin-bottom: var(--s-2);
}

.analytics__blocker-list {
  display: flex;
  flex-direction: column;
}

.analytics__blocker {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-2) 0;
  border-bottom: 1px solid var(--grid);
}

.analytics__blocker-text {
  color: var(--ink);
  max-width: 62ch;
}

.analytics__blocker-meta {
  font-size: 0.8125rem;
  color: var(--signal);
}

@media (max-width: 60rem) {
  .analytics__axis {
    width: 100%;
    margin-left: 0;
  }

  .analytics__row {
    grid-template-columns: 1fr;
    gap: var(--s-1);
  }

  .analytics__name {
    white-space: normal;
  }
}
</style>
