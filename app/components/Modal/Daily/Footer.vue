<script lang="ts" setup>
import { StepSendDaily } from '~/types/modalDaily'

type Props = {
  step: StepSendDaily
}

const { step } = defineProps<Props>()
const emits = defineEmits<{
  next: []
  back: []
}>()
</script>

<template>
  <div class="flex gap-3 w-full">
    <UButton
      v-if="step !== StepSendDaily.ACCEPT_LAST_DAILY"
      label="Назад"
      variant="outline"
      class="flex-1"
      @click="emits('back')"
    />
    <UButton
      :label="step === StepSendDaily.ACCEPT_LAST_DAILY ? 'Далее' : 'Отправить'"
      class="flex-1"
      :class="{ 'justify-center': step === StepSendDaily.ACCEPT_LAST_DAILY }"
      @click="emits('next')"
    />
  </div>
</template>

<style lang="scss" scoped>
</style>
