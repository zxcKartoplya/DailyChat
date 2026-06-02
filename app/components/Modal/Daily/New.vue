<script lang="ts" setup>
type Task = {
  id: string
  text: string
}

const tasks = ref<Task[]>([])

const addTask = (text: string) => {
  if (!text.trim()) return
  tasks.value.push({ id: Date.now().toString(), text: text.trim() })
}

const deleteTask = (id: string) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
}

const updateTask = (id: string, text: string) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    task.text = text
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ModalDailyCreateTask @add-task="addTask" />
    <ModalDailyTaskList
      v-if="tasks.length"
      :tasks="tasks"
      @delete="deleteTask"
      @update="updateTask"
    />
    <p
      v-else
      class="text-sm text-center text-muted"
    >
      Нет задач. Добавьте первую!
    </p>
  </div>
</template>
