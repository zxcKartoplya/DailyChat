<script lang="ts" setup>
import type { DraftItem } from '~/types/daily'
import { ItemStatus } from '~/types/daily'

type Props = {
  editable?: boolean
}

const { editable = true } = defineProps<Props>()
const items = defineModel<DraftItem[]>({ default: () => [] })

const inputs = ref<HTMLTextAreaElement[]>([])
const openLinks = ref<Set<string>>(new Set())

const makeItem = (): DraftItem => ({
  key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  chainId: null,
  text: '',
  status: ItemStatus.IN_PROGRESS,
  link: null
})

const rows = computed(() => items.value)

const ensureTrailingRow = () => {
  const last = items.value.at(-1)

  if (!last || last.text.trim().length > 0) {
    items.value = [...items.value, makeItem()]
  }
}

const resize = (element: HTMLTextAreaElement) => {
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

const focusRow = (index: number, atEnd = false) => {
  nextTick(() => {
    const element = inputs.value[index]

    if (!element) return

    element.focus()

    if (atEnd) {
      const end = element.value.length
      element.setSelectionRange(end, end)
    }

    resize(element)
  })
}

const onInput = (index: number, event: Event) => {
  const element = event.target as HTMLTextAreaElement
  const next = [...items.value]
  const item = next[index]

  if (!item) return

  next[index] = { ...item, text: element.value }
  items.value = next
  resize(element)
  ensureTrailingRow()
}

const onEnter = (index: number) => {
  const item = items.value[index]

  if (!item || item.text.trim().length === 0) return

  const next = [...items.value]
  next.splice(index + 1, 0, makeItem())
  items.value = next
  focusRow(index + 1)
}

const onBackspace = (index: number, event: KeyboardEvent) => {
  const element = event.target as HTMLTextAreaElement

  if (element.value.length > 0 || element.selectionStart !== 0) return
  if (items.value.length <= 1) return

  event.preventDefault()

  const next = [...items.value]
  next.splice(index, 1)
  items.value = next
  focusRow(Math.max(index - 1, 0), true)
}

const toggleLink = (key: string) => {
  const next = new Set(openLinks.value)

  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }

  openLinks.value = next
}

const setLink = (index: number, value: string) => {
  const next = [...items.value]
  const item = next[index]

  if (!item) return

  next[index] = { ...item, link: value.trim() ? value.trim() : null }
  items.value = next
}

onMounted(() => {
  if (editable) ensureTrailingRow()
})
</script>

<template>
  <div class="list">
    <div
      v-for="(item, index) in rows"
      :key="item.key"
      class="list__row"
    >
      <span
        class="list__bullet"
        aria-hidden="true"
      />

      <div class="list__content">
        <textarea
          v-if="editable"
          :ref="el => { if (el) inputs[index] = el as HTMLTextAreaElement }"
          :value="item.text"
          class="list__input"
          rows="1"
          :placeholder="index === 0 ? 'что нового сегодня?' : ''"
          :aria-label="`Новый пункт ${index + 1}`"
          @input="onInput(index, $event)"
          @keydown.enter.exact.prevent="onEnter(index)"
          @keydown.backspace="onBackspace(index, $event)"
        />

        <p
          v-else
          class="list__text"
        >
          {{ item.text }}
        </p>

        <input
          v-if="editable && openLinks.has(item.key)"
          :value="item.link ?? ''"
          class="field list__link-field"
          type="url"
          placeholder="ссылка на задачу, документ или PR"
          :aria-label="`Ссылка для пункта ${index + 1}`"
          @input="setLink(index, ($event.target as HTMLInputElement).value)"
        >

        <a
          v-else-if="!editable && item.link"
          :href="item.link"
          class="list__link"
          target="_blank"
          rel="noopener"
        >{{ item.link }}</a>
      </div>

      <button
        v-if="editable"
        type="button"
        class="list__link-toggle"
        :class="{ 'list__link-toggle--set': item.link }"
        :aria-label="item.link ? 'Изменить ссылку' : 'Добавить ссылку'"
        :aria-expanded="openLinks.has(item.key)"
        @click="toggleLink(item.key)"
      >
        <UIcon name="i-lucide-link" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
}

.list__row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: var(--s-3);
  padding: var(--s-2) 0;
  border-bottom: 1px solid var(--grid);
}

.list__row:last-child {
  border-bottom: 0;
}

.list__bullet {
  width: 5px;
  height: 5px;
  margin-top: 0.6rem;
  background: var(--ink-3);
  border-radius: 50%;
}

.list__content {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  min-width: 0;
}

.list__input {
  width: 100%;
  padding: 0.25rem 0;
  background: transparent;
  color: var(--ink);
  border: 0;
  outline: none;
  resize: none;
  overflow: hidden;
  font: inherit;
  font-size: 1rem;
  line-height: 1.45;
}

.list__input::placeholder {
  color: var(--ink-3);
}

.list__text {
  padding: 0.25rem 0;
  font-size: 1rem;
  color: var(--ink);
  max-width: 68ch;
}

.list__link-field {
  max-width: 32rem;
  font-size: 0.875rem;
}

.list__link {
  font-size: 0.8125rem;
  color: var(--accent-text);
  text-decoration: underline;
  text-underline-offset: 3px;
  word-break: break-all;
}

.list__link-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ctrl-h-sm);
  height: var(--ctrl-h-sm);
  color: var(--ink-3);
  background: transparent;
  border: 0;
  border-radius: var(--r-1);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--t-state) var(--ease), color var(--t-state) var(--ease), background-color var(--t-state) var(--ease);
}

.list__row:hover .list__link-toggle,
.list__link-toggle:focus-visible,
.list__link-toggle--set {
  opacity: 1;
}

.list__link-toggle:hover {
  color: var(--ink);
  background: var(--surface-hover);
}

.list__link-toggle--set {
  color: var(--accent-text);
}

@media (max-width: 48rem) {
  .list__link-toggle {
    opacity: 1;
  }
}
</style>
