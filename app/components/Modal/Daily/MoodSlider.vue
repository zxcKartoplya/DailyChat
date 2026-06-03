<script lang="ts" setup>
const mood = defineModel<number>({ default: 10 })

const emoji = computed(() => {
  if (mood.value <= 3) return '😞'
  if (mood.value <= 6) return '😐'
  if (mood.value <= 8) return '🙂'
  return '😄'
})
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <div class="flex justify-between text-sm text-muted">
      <span>Настроение</span>
      <span class="font-medium">{{ emoji }} {{ mood }} / 10</span>
    </div>
    <div class="flex gap-1">
      <UButton
        v-for="n in 10"
        :key="n"
        :label="String(n)"
        :variant="mood === n ? 'solid' : 'outline'"
        color="primary"
        size="sm"
        class="flex-1 justify-center"
        @click="mood = n"
      />
    </div>
  </div>
</template>
