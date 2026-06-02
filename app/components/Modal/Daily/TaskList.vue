<script lang="ts" setup>
type Task = {
  id: string
  text: string
}

const { tasks } = defineProps<{ tasks: Task[] }>()
const emits = defineEmits<{
  delete: [id: string]
  update: [id: string, text: string]
}>()

const editingId = ref<string | null>(null)
const editingText = ref('')

const startEdit = (task: Task) => {
  editingId.value = task.id
  editingText.value = task.text
}

const saveEdit = (id: string) => {
  if (editingText.value.trim()) {
    emits('update', id, editingText.value.trim())
  }
  editingId.value = null
}

const cancelEdit = () => {
  editingId.value = null
}
</script>

<template>
  <div class="flex flex-col-reverse gap-2">
    <div
      v-for="task in tasks"
      :key="task.id"
      class="flex items-center gap-2"
    >
      <template v-if="editingId === task.id">
        <UInput
          v-model="editingText"
          class="flex-1"
          autofocus
          @keyup.enter="saveEdit(task.id)"
          @keyup.escape="cancelEdit"
        />
        <UButton
          icon="i-lucide-check"
          color="success"
          variant="ghost"
          size="sm"
          @click="saveEdit(task.id)"
        />
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="cancelEdit"
        />
      </template>

      <template v-else>
        <span class="flex-1 text-sm">{{ task.text }}</span>
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="startEdit(task)"
        />
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          @click="emits('delete', task.id)"
        />
      </template>
    </div>
  </div>
</template>
