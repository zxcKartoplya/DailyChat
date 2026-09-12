<script lang="ts" setup>
import type { DraftItem } from '~/types/daily'
import { ItemStatus } from '~/types/daily'
import { lineColorVar } from '~/utils/lineColor'

type Props = {
  editable?: boolean
}

const { editable = true } = defineProps<Props>()
const items = defineModel<DraftItem[]>({ default: () => [] })

const composer = ref('')
const composerField = ref<HTMLTextAreaElement | null>(null)
const editingKey = ref<string | null>(null)

const makeItem = (text: string): DraftItem => ({
  key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  chainId: null,
  text,
  status: ItemStatus.IN_PROGRESS,
  link: null
})

const { resize } = useAutosize(composerField, () => composer.value)

const commit = () => {
  const text = composer.value.trim()

  if (!text) return

  if (editingKey.value) {
    items.value = items.value.map(item => (item.key === editingKey.value ? { ...item, text } : item))
    editingKey.value = null
  } else {
    items.value = [...items.value, makeItem(text)]
  }

  composer.value = ''
  nextTick(resize)
}

const pullBack = () => {
  const last = items.value.at(-1)

  if (!last) return

  items.value = items.value.slice(0, -1)
  composer.value = last.text
  editingKey.value = null
  nextTick(() => {
    resize()
    composerField.value?.focus()
  })
}

const onBackspace = (event: KeyboardEvent) => {
  if (composer.value.length > 0) return
  if (!items.value.length) return

  event.preventDefault()
  pullBack()
}

const edit = (item: DraftItem) => {
  if (!editable) return

  items.value = items.value.filter(entry => entry.key !== item.key)
  composer.value = item.text
  editingKey.value = null
  nextTick(() => {
    resize()
    composerField.value?.focus()
  })
}

const remove = (key: string) => {
  items.value = items.value.filter(item => item.key !== key)
}

const setLink = (key: string, value: string) => {
  items.value = items.value.map(item => (
    item.key === key ? { ...item, link: value.trim() ? value.trim() : null } : item
  ))
}

const linkOpen = ref<string | null>(null)

const toggleLink = (key: string) => {
  linkOpen.value = linkOpen.value === key ? null : key
}
</script>

<template>
  <div class="branch">
    <ul
      v-if="items.length"
      class="branch__list"
    >
      <li
        v-for="item in items"
        :key="item.key"
        class="branch__item"
        :style="{ '--line': lineColorVar(item.key) }"
      >
        <span
          class="branch__station"
          aria-hidden="true"
        />

        <div class="branch__body">
          <button
            v-if="editable"
            type="button"
            class="branch__text"
            @click="edit(item)"
          >
            {{ item.text }}
          </button>
          <p
            v-else
            class="branch__text branch__text--static"
          >
            {{ item.text }}
          </p>

          <input
            v-if="editable && linkOpen === item.key"
            :value="item.link ?? ''"
            class="field branch__link-field"
            type="url"
            placeholder="ссылка на задачу или документ"
            :aria-label="`Ссылка для пункта «${item.text}»`"
            @input="setLink(item.key, ($event.target as HTMLInputElement).value)"
          >

          <a
            v-else-if="item.link"
            :href="item.link"
            class="branch__link"
            target="_blank"
            rel="noopener"
          >{{ item.link }}</a>
        </div>

        <div
          v-if="editable"
          class="branch__actions"
        >
          <button
            type="button"
            class="branch__action"
            :class="{ 'branch__action--set': item.link }"
            :aria-label="item.link ? 'Изменить ссылку' : 'Добавить ссылку'"
            @click="toggleLink(item.key)"
          >
            <UIcon name="i-lucide-link" />
          </button>
          <button
            type="button"
            class="branch__action"
            aria-label="Убрать пункт"
            @click="remove(item.key)"
          >
            <UIcon name="i-lucide-x" />
          </button>
        </div>
      </li>
    </ul>

    <div
      v-if="editable"
      class="branch__composer"
    >
      <span
        class="branch__station branch__station--new"
        aria-hidden="true"
      />
      <textarea
        ref="composerField"
        v-model="composer"
        class="branch__input"
        rows="1"
        placeholder="что нового сегодня? Enter — следующий пункт"
        aria-label="Новый пункт"
        @input="resize"
        @keydown.enter.exact.prevent="commit"
        @keydown.backspace="onBackspace"
      />
      <button
        type="button"
        class="btn btn--secondary btn--sm branch__add"
        :disabled="!composer.trim()"
        @click="commit"
      >
        Добавить
      </button>
    </div>
  </div>
</template>

<style scoped>
.branch {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.branch__list {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}

.branch__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-2) var(--s-3);
  border-radius: var(--r-field);
  transition: background-color var(--t-state) var(--ease);
}

.branch__item:hover {
  background: var(--surface-hover);
}

.branch__station {
  flex: none;
  width: 13px;
  height: 13px;
  background: var(--surface);
  border: 3px solid var(--line, var(--ink-3));
  border-radius: 50%;
}

.branch__station--new {
  border-style: dashed;
  border-width: 2px;
  border-color: var(--ink-3);
}

.branch__body {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  min-width: 0;
}

.branch__text {
  padding: 0;
  background: none;
  border: 0;
  font: inherit;
  font-size: 1rem;
  color: var(--ink);
  text-align: left;
  cursor: text;
  max-width: 66ch;
}

.branch__text--static {
  cursor: default;
}

.branch__link-field {
  max-width: 30rem;
  font-size: 0.875rem;
}

.branch__link {
  font-size: 0.8125rem;
  color: var(--accent-text);
  text-decoration: underline;
  text-underline-offset: 3px;
  word-break: break-all;
}

.branch__actions {
  display: flex;
  gap: var(--s-1);
  opacity: 0;
  transition: opacity var(--t-state) var(--ease);
}

.branch__item:hover .branch__actions,
.branch__actions:focus-within {
  opacity: 1;
}

.branch__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 0;
  border-radius: 50%;
  color: var(--ink-3);
  cursor: pointer;
  transition: color var(--t-state) var(--ease), background-color var(--t-state) var(--ease);
}

.branch__action:hover {
  color: var(--ink);
  background: var(--surface-active);
}

.branch__action--set {
  color: var(--accent-text);
  opacity: 1;
}

.branch__composer {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-2) var(--s-3);
  background: var(--surface);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--r-panel);
  transition: border-color var(--t-state) var(--ease), box-shadow var(--t-state) var(--ease);
}

.branch__composer:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-weak);
}

.branch__input {
  min-height: 2rem;
  padding: 0.375rem 0;
  background: transparent;
  border: 0;
  outline: none;
  resize: none;
  overflow: hidden;
  font: inherit;
  font-size: 1rem;
  color: var(--ink);
}

.branch__input::placeholder {
  color: var(--ink-3);
}

@media (max-width: 48rem) {
  .branch__actions {
    opacity: 1;
  }

  .branch__add {
    display: none;
  }
}
</style>
