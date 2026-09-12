import { useDailyApi } from '~/composables/api/useDailyApi'
import type { DailyDay, DraftItem } from '~/types/daily'
import { DayType, EntryStatus, ItemStatus } from '~/types/daily'
import { todayIso } from '~/utils/date'

type ChainDraft = {
  text: string
  status: ItemStatus
}

const AUTOSAVE_DELAY = 800

const draftStorageKey = (date: string) => `daily-draft:${date}`

export const useDailyStore = defineStore('daily', () => {
  const api = useDailyApi()

  const date = ref<string>(todayIso())
  const day = ref<DailyDay | null>(null)
  const chainDrafts = ref<Record<string, ChainDraft>>({})
  const newItems = ref<DraftItem[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const saveFailed = ref(false)
  const savedAt = ref<string | null>(null)
  const submittedAt = ref<string | null>(null)
  const dayType = ref<DayType>(DayType.WORK)

  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const isToday = computed(() => date.value === todayIso())
  const isDayOff = computed(() => dayType.value === DayType.OFF)
  const isSubmitted = computed(() => submittedAt.value !== null)

  const isEditable = computed(() => {
    if (!day.value) return false
    if (isToday.value) return true

    return date.value >= day.value.editableFrom && day.value.missingDays.includes(date.value)
  })

  const openChains = computed(() => day.value?.openChains ?? [])
  const missingDays = computed(() => day.value?.missingDays ?? [])

  const chainDraft = (chainId: string): ChainDraft => {
    return chainDrafts.value[chainId] ?? { text: '', status: ItemStatus.IN_PROGRESS }
  }

  const isChainTouched = (chainId: string): boolean => {
    const draft = chainDrafts.value[chainId]

    if (!draft) return false

    return draft.text.trim().length > 0 || draft.status !== ItemStatus.IN_PROGRESS
  }

  const items = computed<DraftItem[]>(() => {
    if (isDayOff.value) return []

    const fromChains = openChains.value
      .filter(chain => isChainTouched(chain.chainId))
      .map<DraftItem>(chain => ({
        key: chain.chainId,
        chainId: chain.chainId,
        text: chainDraft(chain.chainId).text.trim(),
        status: chainDraft(chain.chainId).status,
        link: null
      }))

    const fromNew = newItems.value
      .filter(item => item.text.trim().length > 0)
      .map<DraftItem>(item => ({ ...item, text: item.text.trim() }))

    return [...fromChains, ...fromNew]
  })

  const canSubmit = computed(() => isDayOff.value || items.value.length > 0)

  const readLocalDraft = () => {
    if (import.meta.server) return

    try {
      const raw = localStorage.getItem(draftStorageKey(date.value))

      if (!raw) return

      const parsed = JSON.parse(raw) as {
        chainDrafts?: Record<string, ChainDraft>
        newItems?: DraftItem[]
        dayType?: DayType
      }

      if (parsed.chainDrafts) chainDrafts.value = parsed.chainDrafts
      if (parsed.newItems?.length) newItems.value = parsed.newItems
      if (parsed.dayType) dayType.value = parsed.dayType
    } catch {
      localStorage.removeItem(draftStorageKey(date.value))
    }
  }

  const writeLocalDraft = () => {
    if (import.meta.server) return

    try {
      localStorage.setItem(draftStorageKey(date.value), JSON.stringify({
        chainDrafts: chainDrafts.value,
        newItems: newItems.value,
        dayType: dayType.value
      }))
    } catch {
      saveFailed.value = true
    }
  }

  const load = async (target = todayIso()) => {
    loading.value = true
    date.value = target
    chainDrafts.value = {}
    newItems.value = []
    savedAt.value = null
    saveFailed.value = false

    try {
      const result = await api.getDay(target)
      day.value = result
      dayType.value = result.entry?.dayType ?? DayType.WORK
      submittedAt.value = result.entry?.status === EntryStatus.SUBMITTED
        ? result.entry.submittedAt
        : null

      result.entry?.items.forEach((item) => {
        if (!item.chainId) {
          newItems.value.push({
            key: `item-${item.id}`,
            chainId: null,
            text: item.text,
            status: item.status,
            link: item.link
          })

          return
        }

        chainDrafts.value[item.chainId] = { text: item.text, status: item.status }
      })

      readLocalDraft()
    } finally {
      loading.value = false
    }
  }

  const persist = async () => {
    if (!day.value?.entry || !isEditable.value) return

    saving.value = true
    saveFailed.value = false

    try {
      await api.saveItems(day.value.entry.id, items.value)
      savedAt.value = new Date().toISOString()
    } catch {
      saveFailed.value = true
    } finally {
      saving.value = false
    }
  }

  const scheduleSave = () => {
    writeLocalDraft()

    if (saveTimer) clearTimeout(saveTimer)

    saveTimer = setTimeout(() => {
      void persist()
    }, AUTOSAVE_DELAY)
  }

  const setChainText = (chainId: string, text: string) => {
    chainDrafts.value[chainId] = { ...chainDraft(chainId), text }
    scheduleSave()
  }

  const setChainStatus = (chainId: string, status: ItemStatus) => {
    chainDrafts.value[chainId] = { ...chainDraft(chainId), status }
    scheduleSave()
  }

  const setNewItems = (value: DraftItem[]) => {
    newItems.value = value
    scheduleSave()
  }

  const setDayType = async (value: DayType) => {
    dayType.value = value
    writeLocalDraft()

    if (!day.value?.entry) return

    saving.value = true

    try {
      await api.setDayType(day.value.entry.id, value)
      savedAt.value = new Date().toISOString()
    } catch {
      saveFailed.value = true
    } finally {
      saving.value = false
    }
  }

  const markDaysOff = async (dates: string[]) => {
    if (!day.value) return

    saving.value = true

    try {
      await Promise.all(dates.map(() => api.setDayType(day.value?.entry?.id ?? 0, DayType.OFF)))
      day.value = {
        ...day.value,
        missingDays: day.value.missingDays.filter(date => !dates.includes(date))
      }
    } catch {
      saveFailed.value = true
    } finally {
      saving.value = false
    }
  }

  const submit = async () => {
    if (!day.value?.entry || !canSubmit.value) return

    if (saveTimer) clearTimeout(saveTimer)

    saving.value = true
    saveFailed.value = false

    try {
      await api.saveItems(day.value.entry.id, items.value)
      submittedAt.value = await api.submitEntry(day.value.entry.id)
      savedAt.value = submittedAt.value
    } catch {
      saveFailed.value = true
      throw new Error('submit failed')
    } finally {
      saving.value = false
    }
  }

  const retrySave = () => persist()

  return {
    date,
    day,
    loading,
    saving,
    saveFailed,
    savedAt,
    submittedAt,
    dayType,
    newItems,
    openChains,
    missingDays,
    items,
    isToday,
    isDayOff,
    isSubmitted,
    isEditable,
    canSubmit,
    chainDraft,
    isChainTouched,
    load,
    setChainText,
    setChainStatus,
    setNewItems,
    setDayType,
    markDaysOff,
    submit,
    retrySave
  }
})
