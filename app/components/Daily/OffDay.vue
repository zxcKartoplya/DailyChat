<script lang="ts" setup>
import { useOffReasonsStore } from '~/stores/offReasons'
import type { OffReason } from '~/types/daily'
import { OFF_REASON_NOTE_MAX } from '~/types/daily'

type Props = {
  reason: OffReason | null
  editable?: boolean
}

const { reason, editable = true } = defineProps<Props>()
const note = defineModel<string>('note', { default: '' })

const emits = defineEmits<{
  select: [reason: OffReason | null]
}>()

const reasons = useOffReasonsStore()

const option = computed(() => reasons.find(reason))
const noteOpen = computed(() => editable && option.value?.requiresNote === true)
</script>

<template>
  <section class="off panel">
    <div class="off__head">
      <p class="off__title">
        День отмечен нерабочим<span
          v-if="option"
          class="off__reason"
        >: {{ option.label }}</span>
      </p>

      <DailyOffReasonMenu
        v-if="editable"
        :selected="reason"
        @select="emits('select', $event)"
      >
        <button
          type="button"
          class="btn btn--ghost btn--sm"
        >
          {{ reason ? 'сменить причину' : 'указать причину' }}
        </button>
      </DailyOffReasonMenu>
    </div>

    <textarea
      v-if="noteOpen"
      v-model="note"
      class="field off__note"
      rows="2"
      :maxlength="OFF_REASON_NOTE_MAX"
      placeholder="что случилось"
      aria-label="Что случилось"
    />
    <p
      v-else-if="!editable && note"
      class="off__note-text"
    >
      {{ note }}
    </p>

    <p class="off__text">
      Пунктов в нём нет, линии останутся открытыми и придут завтра.
    </p>
  </section>
</template>

<style scoped>
.off {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  padding: var(--s-4) var(--s-5);
  max-width: 62ch;
}

.off__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2) var(--s-3);
}

.off__title {
  color: var(--ink);
}

.off__reason {
  font-weight: 500;
}

.off__note {
  resize: vertical;
}

.off__note-text {
  color: var(--ink);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.off__text {
  color: var(--ink-2);
}
</style>
