<script lang="ts" setup>
import { useDailyApi } from '~/composables/api/useDailyApi'
import type { OpenChain } from '~/types/daily'
import { ItemStatus } from '~/types/daily'
import { lastDays, todayIso } from '~/utils/date'
import { lineColorVar } from '~/utils/lineColor'
import { plural, pluralDays } from '~/utils/plural'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Аналитика' })

const { getDay } = useDailyApi()

const chains = ref<OpenChain[]>([])
const loading = ref(true)

const days = computed(() => lastDays(14))

const blocked = computed(() => chains.value.filter(chain => chain.lastStatus === ItemStatus.BLOCKED))

const longest = computed(() => chains.value.reduce((max, chain) => Math.max(max, chain.daysOpen), 0))

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
        Сейчас в пути <span class="num analytics__figure">{{ chains.length }}</span>
        {{ plural(chains.length, ['линия', 'линии', 'линий']) }}.
        <template v-if="blocked.length">
          <span class="num analytics__figure analytics__figure--alert">{{ blocked.length }}</span>
          {{ plural(blocked.length, ['стоит', 'стоят', 'стоят']) }} в задержке.
        </template>
        Самая давняя идёт <span class="num analytics__figure">{{ pluralDays(longest) }}</span>.
      </p>

      <section class="analytics__map panel">
        <div class="analytics__axis">
          <DailyAxis :days="days" />
        </div>

        <ul class="analytics__rows">
          <li
            v-for="chain in chains"
            :key="chain.chainId"
            class="analytics__row"
          >
            <span class="analytics__name">
              <span
                class="analytics__badge"
                :style="{ background: lineColorVar(chain.chainId) }"
                aria-hidden="true"
              />
              {{ chain.title }}
            </span>
            <DailyRoute
              :days="days"
              :history="chain.history"
              :color="lineColorVar(chain.chainId)"
            />
          </li>
        </ul>

        <DailyLegend />
      </section>

      <section
        v-if="blocked.length"
        class="analytics__blockers"
      >
        <h2 class="analytics__section-title">
          Что стоит прямо сейчас
        </h2>
        <ul class="analytics__blocker-list">
          <li
            v-for="chain in blocked"
            :key="chain.chainId"
            class="analytics__blocker panel"
          >
            <span class="analytics__blocker-title">{{ chain.title }}</span>
            <span class="analytics__blocker-text">{{ chain.lastText }}</span>
            <span class="analytics__blocker-meta num">{{ pluralDays(chain.daysOpen) }} в пути</span>
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
}

.analytics__title {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.015em;
}

.analytics__lead,
.analytics__loading {
  color: var(--ink-2);
  font-size: 0.9375rem;
  max-width: 62ch;
}

.analytics__summary {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--ink);
  max-width: 52ch;
}

.analytics__figure {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent-text);
}

.analytics__figure--alert {
  color: var(--alert);
}

.analytics__map {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  padding: var(--s-4) var(--s-5) var(--s-5);
}

.analytics__axis {
  margin-left: auto;
  width: min(100%, 26rem);
}

.analytics__rows {
  display: flex;
  flex-direction: column;
}

.analytics__row {
  display: grid;
  grid-template-columns: 1fr min(55%, 26rem);
  align-items: center;
  gap: var(--s-4);
}

.analytics__name {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-size: 0.9375rem;
  color: var(--ink);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.analytics__badge {
  flex: none;
  width: 6px;
  height: 1.25rem;
  border-radius: var(--r-pill);
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
  gap: var(--s-2);
}

.analytics__blocker {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  padding: var(--s-3) var(--s-4);
  border-color: color-mix(in srgb, var(--alert) 35%, var(--hairline));
}

.analytics__blocker-title {
  font-weight: 600;
  color: var(--ink);
}

.analytics__blocker-text {
  color: var(--ink-2);
  max-width: 66ch;
}

.analytics__blocker-meta {
  font-size: 0.8125rem;
  color: var(--alert);
}

@media (max-width: 60rem) {
  .analytics__axis {
    width: 100%;
    margin-left: 0;
  }

  .analytics__row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .analytics__name {
    white-space: normal;
  }
}
</style>
