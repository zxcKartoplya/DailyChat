import { useDailyApi } from '~/composables/api/useDailyApi'
import { useOffReasonsStore } from '~/stores/offReasons'
import type { DailyDay, DailyEntry, DayWrite, DraftItem, OffReason } from '~/types/daily'
import { DayType, EntryStatus, ItemStatus, OFF_REASON_NOTE_MAX } from '~/types/daily'
import { todayIso } from '~/utils/date'

type OffPayload = Pick<DayWrite, 'offReason' | 'offReasonNote'>

type ChainDraft = {
  marked: boolean
  text: string
  status: ItemStatus
}

const AUTOSAVE_DELAY = 800

const draftStorageKey = (date: string) => `daily-draft:${date}`

export const useDailyStore = defineStore('daily', () => {
  const api = useDailyApi()
  const offReasons = useOffReasonsStore()

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
  const offReason = ref<OffReason | null>(null)
  const offReasonNote = ref('')

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  let pendingSave: Promise<boolean> | null = null
  let dirty = false
  let loadSeq = 0
  let openSeq = 0

  const isToday = computed(() => date.value === todayIso())
  const isDayOff = computed(() => dayType.value === DayType.OFF)
  const isSubmitted = computed(() => submittedAt.value !== null)
  const isEditable = computed(() => day.value?.editable ?? false)
  const editableUntil = computed(() => day.value?.editableUntil ?? null)

  const openChains = computed(() => day.value?.openChains ?? [])
  const missingDays = computed(() => day.value?.missingDays ?? [])

  const chainDraft = (chainId: string): ChainDraft => {
    return chainDrafts.value[chainId] ?? { marked: false, text: '', status: ItemStatus.IN_PROGRESS }
  }

  const isChainTouched = (chainId: string): boolean => chainDraft(chainId).marked

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

  const offPayload = computed<OffPayload>(() => {
    if (!isDayOff.value || !offReason.value) return { offReason: null, offReasonNote: null }

    const note = offReasonNote.value.trim()
    const requiresNote = offReasons.find(offReason.value)?.requiresNote ?? note.length > 0

    if (!requiresNote) return { offReason: offReason.value, offReasonNote: null }
    if (!note || note.length > OFF_REASON_NOTE_MAX) return { offReason: null, offReasonNote: null }

    return { offReason: offReason.value, offReasonNote: note }
  })

  const dayWrite = (): DayWrite => ({
    dayType: dayType.value,
    ...offPayload.value,
    items: items.value
  })

  const canSubmit = computed(() => isDayOff.value || items.value.length > 0)

  const isCurrent = (seq: number) => seq === loadSeq

  const cancelSaveTimer = () => {
    if (!saveTimer) return

    clearTimeout(saveTimer)
    saveTimer = null
  }

  const readLocalDraft = () => {
    if (import.meta.server) return

    try {
      const raw = localStorage.getItem(draftStorageKey(date.value))

      if (!raw) return

      const parsed = JSON.parse(raw) as {
        chainDrafts?: Record<string, ChainDraft>
        newItems?: DraftItem[]
        dayType?: DayType
      } & Partial<OffPayload>

      if (parsed.chainDrafts) chainDrafts.value = parsed.chainDrafts

      const restored = parsed.newItems?.filter(item => item.text.trim().length > 0) ?? []

      if (restored.length) newItems.value = restored
      if (parsed.dayType) dayType.value = parsed.dayType

      if (parsed.offReason !== undefined) {
        offReason.value = parsed.offReason
        offReasonNote.value = parsed.offReasonNote ?? ''
      }
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
        dayType: dayType.value,
        ...offPayload.value
      }))
    } catch {
      saveFailed.value = true
    }
  }

  const load = async (target: string) => {
    loadSeq += 1
    const seq = loadSeq

    loading.value = true
    saving.value = false
    date.value = target
    chainDrafts.value = {}
    newItems.value = []
    savedAt.value = null
    saveFailed.value = false
    dirty = false

    try {
      const result = await api.getDay(target)

      if (!isCurrent(seq)) return

      day.value = result
      dayType.value = result.entry?.dayType ?? DayType.WORK
      offReason.value = result.entry?.offReason ?? null
      offReasonNote.value = result.entry?.offReasonNote ?? ''
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

        chainDrafts.value[item.chainId] = { marked: true, text: item.text, status: item.status }
      })

      if (result.editable) readLocalDraft()
    } finally {
      if (isCurrent(seq)) loading.value = false
    }
  }

  const applyEntry = (entry: DailyEntry) => {
    if (!day.value) return

    day.value = { ...day.value, entry }
    submittedAt.value = entry.status === EntryStatus.SUBMITTED ? entry.submittedAt : null
  }

  const runSave = async (): Promise<boolean> => {
    const seq = loadSeq
    const target = date.value
    const payload = dayWrite()

    dirty = false
    saving.value = true
    saveFailed.value = false

    try {
      const entry = await api.saveDay(target, payload)

      if (isCurrent(seq)) {
        applyEntry(entry)
        savedAt.value = new Date().toISOString()
      }

      return true
    } catch {
      if (isCurrent(seq)) {
        dirty = true
        saveFailed.value = true
      }

      return false
    } finally {
      if (isCurrent(seq)) saving.value = false
    }
  }

  const persist = (): Promise<boolean> => {
    if (!isEditable.value || loading.value) return Promise.resolve(true)

    const request = runSave()

    pendingSave = request
    void request.finally(() => {
      if (pendingSave === request) pendingSave = null
    })

    return request
  }

  const flush = async (): Promise<boolean> => {
    cancelSaveTimer()

    const inFlight = pendingSave ? await pendingSave : true

    if (!dirty) return inFlight

    return persist()
  }

  const open = async (target: string): Promise<boolean> => {
    openSeq += 1
    const seq = openSeq

    const saved = await flush()

    if (seq !== openSeq) return saved

    await load(target)

    return saved
  }

  const saveNow = () => {
    if (!isEditable.value) return Promise.resolve(true)

    writeLocalDraft()
    cancelSaveTimer()

    return persist()
  }

  const scheduleSave = () => {
    if (!isEditable.value) return

    dirty = true
    writeLocalDraft()
    cancelSaveTimer()

    saveTimer = setTimeout(() => {
      saveTimer = null
      void persist()
    }, AUTOSAVE_DELAY)
  }

  const setChainText = (chainId: string, text: string) => {
    chainDrafts.value[chainId] = { ...chainDraft(chainId), marked: true, text }
    scheduleSave()
  }

  const setChainStatus = (chainId: string, status: ItemStatus) => {
    chainDrafts.value[chainId] = { ...chainDraft(chainId), marked: true, status }
    scheduleSave()
  }

  const toggleChainMark = (chainId: string) => {
    const draft = chainDraft(chainId)

    chainDrafts.value[chainId] = draft.marked
      ? { marked: false, text: '', status: ItemStatus.IN_PROGRESS }
      : { ...draft, marked: true }

    scheduleSave()
  }

  const setNewItems = (value: DraftItem[]) => {
    newItems.value = value
    scheduleSave()
  }

  const setDayOff = (reason: OffReason | null) => {
    if (reason !== offReason.value) offReasonNote.value = ''

    dayType.value = DayType.OFF
    offReason.value = reason

    return saveNow()
  }

  const setWorkDay = () => {
    dayType.value = DayType.WORK
    offReason.value = null
    offReasonNote.value = ''

    return saveNow()
  }

  const setOffReasonNote = (text: string) => {
    offReasonNote.value = text
    scheduleSave()
  }

  const markDaysOff = async (dates: string[]) => {
    if (!day.value) return

    const seq = loadSeq

    saving.value = true

    try {
      await api.markDaysOff(dates)

      if (isCurrent(seq) && day.value) {
        day.value = {
          ...day.value,
          missingDays: day.value.missingDays.filter(date => !dates.includes(date))
        }
      }
    } catch {
      if (isCurrent(seq)) saveFailed.value = true
    } finally {
      if (isCurrent(seq)) saving.value = false
    }
  }

  const submit = async () => {
    if (!canSubmit.value || !isEditable.value) return

    cancelSaveTimer()

    const seq = loadSeq
    const target = date.value
    const payload = dayWrite()

    dirty = false
    saving.value = true
    saveFailed.value = false

    try {
      await api.saveDay(target, payload)
      const entry = await api.submitEntry(target)

      if (!isCurrent(seq)) return

      applyEntry(entry)
      savedAt.value = submittedAt.value
    } catch {
      if (!isCurrent(seq)) return

      dirty = true
      saveFailed.value = true
      throw new Error('submit failed')
    } finally {
      if (isCurrent(seq)) saving.value = false
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
    offReason,
    offReasonNote,
    newItems,
    openChains,
    missingDays,
    items,
    isToday,
    isDayOff,
    isSubmitted,
    isEditable,
    editableUntil,
    canSubmit,
    chainDraft,
    isChainTouched,
    open,
    setChainText,
    setChainStatus,
    toggleChainMark,
    setNewItems,
    setDayOff,
    setWorkDay,
    setOffReasonNote,
    markDaysOff,
    submit,
    retrySave
  }
})
