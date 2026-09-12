<script lang="ts" setup>
type Props = {
  withWordmark?: boolean
}

const { withWordmark = true } = defineProps<Props>()
</script>

<template>
  <span class="logo">
    <svg
      class="logo__mark"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      <g class="logo__grid">
        <line
          x1="3"
          y1="3"
          x2="3"
          y2="21"
        />
        <line
          x1="12"
          y1="3"
          x2="12"
          y2="21"
        />
        <line
          x1="21"
          y1="3"
          x2="21"
          y2="21"
        />
      </g>
      <polyline
        class="logo__thread"
        points="3,17 12,13 21,6"
      />
      <circle
        class="logo__node"
        cx="12"
        cy="13"
        r="2"
      />
      <line
        class="logo__terminal"
        x1="21"
        y1="3"
        x2="21"
        y2="9"
      />
    </svg>

    <span
      v-if="withWordmark"
      class="logo__word"
    >Дейлик</span>
  </span>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
}

.logo__mark {
  flex: none;
}

.logo__grid line {
  stroke: var(--grid-strong);
  stroke-width: 1;
}

.logo__thread {
  fill: none;
  stroke: var(--ink);
  stroke-width: 1.8;
  stroke-linejoin: round;
}

.logo__node {
  fill: var(--ink);
}

.logo__terminal {
  stroke: var(--accent);
  stroke-width: 2.4;
}

.logo__word {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
}
</style>
