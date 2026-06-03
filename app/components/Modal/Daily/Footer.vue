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

const showInput = ref(false)
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div
      v-if="step !== StepSendDaily.ACCEPT_LAST_DAILY"
      class="flex flex-col gap-2 "
    >
      <div
        class="flex gap-2 items-center"
        @click="showInput = !showInput"
      >
        <UCheckbox
          v-model="showInput"
          @click.stop
        /> Есть блокеры?
      </div>
      <UInput
        v-if="showInput"
        placeholder="Напишите, что блокирует выполнение задач"
      />
    </div>
    <div class="flex gap-3">
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
  </div>
</template>

<style lang="scss" scoped>
</style>
