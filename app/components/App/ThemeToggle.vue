<script lang="ts" setup>
const { preference, set } = useTheme()

const options = [
  { value: 'light' as const, label: 'светлая', icon: 'i-lucide-sun' },
  { value: 'dark' as const, label: 'тёмная', icon: 'i-lucide-moon' },
  { value: 'system' as const, label: 'как в системе', icon: 'i-lucide-monitor' }
]
</script>

<template>
  <div
    class="toggle"
    role="radiogroup"
    aria-label="Тема оформления"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      class="toggle__option"
      :class="{ 'toggle__option--active': preference === option.value }"
      :aria-checked="preference === option.value"
      :aria-label="option.label"
      :title="option.label"
      @click="set(option.value)"
    >
      <UIcon :name="option.icon" />
    </button>
  </div>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  border: 1px solid var(--grid);
  border-radius: var(--r-1);
  overflow: hidden;
}

.toggle__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 1.875rem;
  background: transparent;
  color: var(--ink-3);
  border: 0;
  border-right: 1px solid var(--grid);
  cursor: pointer;
  transition: color var(--t-state) var(--ease), background-color var(--t-state) var(--ease);
}

.toggle__option:last-child {
  border-right: 0;
}

.toggle__option:hover {
  color: var(--ink);
  background: var(--surface-hover);
}

.toggle__option--active {
  color: var(--accent-text);
  background: var(--accent-weak);
}
</style>
