<script lang="ts" setup>
type Props = {
  today?: boolean
}

const { today = true } = defineProps<Props>()
</script>

<template>
  <dl class="legend">
    <div class="legend__item">
      <dt>
        <svg
          class="legend__glyph"
          viewBox="0 0 32 16"
          aria-hidden="true"
          focusable="false"
        >
          <line
            class="legend__track"
            x1="3"
            y1="8"
            x2="25"
            y2="8"
          />
          <circle
            class="legend__stop"
            cx="26"
            cy="8"
            r="3.5"
          />
        </svg>
      </dt>
      <dd>идёт</dd>
    </div>
    <div class="legend__item">
      <dt>
        <svg
          class="legend__glyph"
          viewBox="0 0 32 16"
          aria-hidden="true"
          focusable="false"
        >
          <polyline
            class="legend__track"
            points="3,11 17,11 24,5"
          />
          <rect
            class="legend__solid"
            x="22.25"
            y="0"
            width="3.5"
            height="10"
            rx="1.75"
          />
        </svg>
      </dt>
      <dd>готово</dd>
    </div>
    <div class="legend__item">
      <dt>
        <svg
          class="legend__glyph"
          viewBox="0 0 32 16"
          aria-hidden="true"
          focusable="false"
        >
          <polyline
            class="legend__track"
            points="3,5 9,5 14,11"
          />
          <line
            class="legend__track legend__track--dashed"
            x1="14"
            y1="11"
            x2="30"
            y2="11"
          />
          <circle
            class="legend__delayed"
            cx="14"
            cy="11"
            r="4"
          />
          <circle
            class="legend__delayed-core"
            cx="14"
            cy="11"
            r="1.75"
          />
        </svg>
      </dt>
      <dd>встал</dd>
    </div>
    <div class="legend__item">
      <dt>
        <svg
          class="legend__glyph"
          viewBox="0 0 32 16"
          aria-hidden="true"
          focusable="false"
        >
          <polyline
            class="legend__track"
            points="3,5 14,5 20,11"
          />
          <circle
            class="legend__solid"
            cx="20"
            cy="11"
            r="3"
          />
          <line
            class="legend__tail"
            x1="20"
            y1="11"
            x2="23.5"
            y2="14.5"
          />
        </svg>
      </dt>
      <dd>бросил</dd>
    </div>
    <div
      v-if="today"
      class="legend__item"
    >
      <dt class="legend__mark legend__mark--today" />
      <dd>сегодня</dd>
    </div>
  </dl>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2) var(--s-5);
  color: var(--ink-3);
  font-size: 0.75rem;
}

.legend__item {
  display: flex;
  align-items: center;
  gap: var(--s-2);
}

.legend__glyph {
  display: block;
  flex: none;
  width: 2rem;
  height: 1rem;
  overflow: visible;
}

.legend__track,
.legend__tail {
  fill: none;
  stroke: var(--ink-3);
  stroke-linecap: round;
  stroke-linejoin: round;
}

.legend__track {
  stroke-width: 3;
}

.legend__track--dashed {
  stroke-dasharray: 1 4.5;
}

.legend__tail {
  stroke-width: 2.5;
}

.legend__stop {
  fill: var(--surface);
  stroke: var(--ink-3);
  stroke-width: 2.5;
}

.legend__delayed {
  fill: var(--surface);
  stroke: var(--alert);
  stroke-width: 1.5;
}

.legend__delayed-core {
  fill: var(--alert);
}

.legend__solid {
  fill: var(--ink-3);
}

.legend__mark {
  flex: none;
  width: 12px;
  height: 12px;
  background: var(--surface);
  border: 3px solid var(--ink-3);
  border-radius: 50%;
}

.legend__mark--today {
  border-width: 2px;
  border-style: dashed;
}
</style>
