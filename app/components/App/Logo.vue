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
      viewBox="0 0 28 28"
      width="28"
      height="28"
      aria-hidden="true"
      focusable="false"
    >
      <path
        class="logo__line logo__line--a"
        d="M3 20 L10 20 L18 12 L25 12"
      />
      <path
        class="logo__line logo__line--b"
        d="M3 8 L11 8 L17 14 L17 25"
      />
      <circle
        class="logo__interchange"
        cx="14"
        cy="16"
        r="4.4"
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

.logo__line {
  fill: none;
  stroke-width: 3.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.logo__line--a {
  stroke: var(--line-1);
}

.logo__line--b {
  stroke: var(--line-2);
}

.logo__interchange {
  fill: var(--surface);
  stroke: var(--ink);
  stroke-width: 2.6;
}

.logo__word {
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
}
</style>
