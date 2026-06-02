<script lang="ts" setup>
const emits = defineEmits<{
  addTask: [string]
}>()

const task = ref('')

const addTask = () => {
  emits('addTask', task.value)
  task.value = ''
}
</script>

<template>
  <div class="flex flex-row gap-3">
    <UInput
      v-model="task"
      class="w-full"
      placeholder="Напишите таску"
      @keyup.enter="addTask"
    />
    <UButton
      icon="material-symbols:add-2"
      @click="addTask"
    />
  </div>
</template>

<style lang="scss" scoped>
</style>
