<script lang="ts" setup>
import { STATUS_LABEL, STATUS_ORDER } from '~/types/daily'
</script>

<template>
  <dl class="legend">
    <div
      v-for="status in STATUS_ORDER"
      :key="status"
      class="legend__item"
    >
      <dt class="legend__glyph">
        <DailyStatusGlyph :status="status" />
      </dt>
      <dd class="legend__label">
        {{ STATUS_LABEL[status] }}
      </dd>
    </div>

    <div class="legend__item">
      <dt class="legend__glyph">
        <svg
          viewBox="0 0 28 14"
          width="28"
          height="14"
          aria-hidden="true"
        >
          <line
            x1="1"
            y1="7"
            x2="26"
            y2="7"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-dasharray="2 3"
          />
        </svg>
      </dt>
      <dd class="legend__label">
        без апдейта
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2) var(--s-4);
  padding-top: var(--s-3);
  color: var(--ink-3);
}

.legend__item {
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

.legend__glyph {
  display: flex;
  color: var(--ink-3);
}

.legend__label {
  font-size: 0.75rem;
}
</style>
