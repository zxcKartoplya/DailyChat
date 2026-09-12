<script lang="ts" setup>
type Props = {
  days: number
}

const { days } = defineProps<Props>()
</script>

<template>
  <div
    class="day-grid"
    :style="{ '--day-columns': days }"
    aria-hidden="true"
  >
    <span
      v-for="column in days"
      :key="column"
    />
  </div>
</template>

<style scoped>
.day-grid {
  position: absolute;
  inset: 0 var(--s-5);
  display: grid;
  grid-template-columns: repeat(var(--day-columns), 1fr);
  pointer-events: none;
}

.day-grid span {
  justify-self: center;
  width: 1px;
  height: 100%;
  background: var(--hairline);
}

@media (max-width: 48rem) {
  .day-grid {
    inset: 0 var(--s-4);
  }
}
</style>
