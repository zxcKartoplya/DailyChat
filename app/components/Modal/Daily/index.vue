<script lang="ts" setup>
import { StepSendDaily } from '~/types/modalDaily'

const open = defineModel<boolean>('open', { default: false })
const step = ref<StepSendDaily>(StepSendDaily.CREATE_NEW_DAILY)
</script>

<template>
  <UDrawer
    v-model:open="open"
    title="Выберите дату дейлика"
    description="Перед заполнением дейлика отметьте выполненные задачи за вчера."
    direction="bottom"
    :handle="false"
    :ui="{ container: ' min-h-[500px]' }"
  >
    <template #body>
      <ModalDailyReview v-if="step === StepSendDaily.ACCEPT_LAST_DAILY" />
      <ModalDailyNew v-if="step === StepSendDaily.CREATE_NEW_DAILY" />
    </template>
    <template #footer>
      <ModalDailyFooter
        :step="step"
        @next="step = StepSendDaily.CREATE_NEW_DAILY"
        @back="step = StepSendDaily.ACCEPT_LAST_DAILY"
      />
    </template>
  </UDrawer>
</template>

<style lang="scss" scoped>
</style>
