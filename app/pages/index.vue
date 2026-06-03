<script lang="ts" setup>
import { useApi } from '~/composables/api/useApi'

const { useGet } = useApi()
const isShowModal = ref<boolean>(false)
const messages = ref([
  {
    id: '2',
    role: 'user' as const,
    parts: [{ type: 'text' as const, text: 'Сегодня закончил задачу по авторизации, начал работу над чатом.' }]
  }
])

const openModal = () => {
  isShowModal.value = true
}
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <UPageCard
    :ui="{ root: 'relative flex rounded-lg ring ring-default h-full', container: 'flex h-full lg:flex flex-col h-full p-4 sm:p-6', body: 'flex flex-col h-full' }"
  >
    <UChatMessages
      :messages="messages"
      :user="{ side: 'right', variant: 'solid' }"
      :assistant="{ side: 'left', variant: 'soft' }"
      class="flex-1 overflow-y-auto"
    />

    <UButton
      class="justify-between h-12 w-full"
      label="Отправить дейлик"
      trailing-icon="mingcute:send-plane-fill"
      size="lg"
      @click="openModal"
    />
    <ModalDaily v-model:open="isShowModal" />
  </UPageCard>
</template>

<style lang="scss" scoped>
</style>
