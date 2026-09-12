<script lang="ts" setup>
import type { OpenChain } from '~/types/daily'
import { ItemStatus, STATUS_HINT, STATUS_LABEL } from '~/types/daily'
import { relativeDayLabel } from '~/utils/date'
import { pluralDays } from '~/utils/plural'

type Props = {
  chain: OpenChain
  days: string[]
  editable?: boolean
}

const { chain, days, editable = true } = defineProps<Props>()

const text = defineModel<string>('text', { default: '' })
const status = defineModel<ItemStatus>('status', { default: ItemStatus.IN_PROGRESS })

const touched = computed(() => text.value.trim().length > 0 || status.value !== ItemStatus.IN_PROGRESS)
const todayStatus = computed(() => (touched.value ? status.value : null))
</script>

<template>
  <article class="chain">
    <div class="chain__body">
      <h3 class="chain__title">
        {{ chain.title }}
      </h3>

      <p class="chain__meta">
        <span class="num">{{ pluralDays(chain.daysOpen) }}</span>
        <span class="chain__dot">·</span>
        <span>{{ relativeDayLabel(chain.lastDate) }}: {{ chain.lastText }}</span>
      </p>

      <div class="chain__rail chain__rail--inline">
        <DailyThread
          :days="days"
          :history="chain.history"
          :today-status="todayStatus"
          :pending="touched"
        />
      </div>

      <template v-if="editable">
        <input
          v-model="text"
          class="field chain__field"
          type="text"
          :placeholder="STATUS_HINT[status]"
          :aria-label="`Апдейт по линии «${chain.title}»`"
        >

        <DailyStatusPicker
          v-model="status"
          :label="`Статус линии «${chain.title}»`"
        />
      </template>

      <template v-else>
        <p
          v-if="text"
          class="chain__record"
        >
          {{ text }}
        </p>
        <p
          v-else
          class="chain__record chain__record--empty"
        >
          записи за этот день нет
        </p>

        <p class="chain__status">
          <DailyStatusGlyph :status="status" />
          <span>{{ STATUS_LABEL[status] }}</span>
        </p>
      </template>
    </div>

    <div class="chain__rail chain__rail--side">
      <DailyThread
        :days="days"
        :history="chain.history"
        :today-status="todayStatus"
        :pending="touched"
      />
    </div>
  </article>
</template>

<style scoped>
.chain {
  display: grid;
  grid-template-columns: 1fr var(--rail-w);
  gap: var(--s-5);
  padding: var(--s-4) 0 var(--s-5);
  border-bottom: 1px solid var(--grid);
}

.chain__body {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  min-width: 0;
}

.chain__title {
  font-size: 1.0625rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--ink);
  max-width: 46ch;
}

.chain__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  font-size: 0.8125rem;
  color: var(--ink-2);
  max-width: 62ch;
}

.chain__meta .num {
  color: var(--ink-3);
}

.chain__dot {
  color: var(--ink-3);
}

.chain__field {
  margin-top: var(--s-1);
  max-width: 42rem;
}

.chain__record {
  margin-top: var(--s-1);
  color: var(--ink);
  max-width: 62ch;
}

.chain__record--empty {
  color: var(--ink-3);
}

.chain__status {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-size: 0.8125rem;
  color: var(--ink-2);
}

.chain__rail--inline {
  display: none;
}

.chain__rail--side {
  padding-top: var(--s-1);
}

@media (max-width: 60rem) {
  .chain {
    grid-template-columns: 1fr;
    gap: var(--s-3);
  }

  .chain__rail--side {
    display: none;
  }

  .chain__rail--inline {
    display: block;
    width: 100%;
    margin: var(--s-1) 0;
  }
}
</style>
