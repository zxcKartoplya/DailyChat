export enum ItemStatus {
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  BLOCKED = 'blocked',
  DROPPED = 'dropped'
}

export enum DayType {
  WORK = 'work',
  OFF = 'off'
}

export enum EntryStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted'
}

export type EntryItem = {
  id: number
  chainId: string | null
  text: string
  status: ItemStatus
  link: string | null
  position: number
}

export type DailyEntry = {
  id: number
  date: string
  dayType: DayType
  status: EntryStatus
  submittedAt: string | null
  items: EntryItem[]
}

export type OpenChain = {
  chainId: string
  title: string
  lastStatus: ItemStatus
  lastText: string
  lastDate: string
  daysOpen: number
  link: string | null
  history: ChainPoint[]
}

export type ChainPoint = {
  date: string
  status: ItemStatus
}

export type DailyDay = {
  entry: DailyEntry | null
  openChains: OpenChain[]
  missingDays: string[]
  editableFrom: string
}

export type DraftItem = {
  key: string
  chainId: string | null
  text: string
  status: ItemStatus
  link: string | null
}

export const STATUS_LABEL: Record<ItemStatus, string> = {
  [ItemStatus.IN_PROGRESS]: 'идёт',
  [ItemStatus.DONE]: 'готово',
  [ItemStatus.BLOCKED]: 'встал',
  [ItemStatus.DROPPED]: 'бросил'
}

export const STATUS_HINT: Record<ItemStatus, string> = {
  [ItemStatus.IN_PROGRESS]: 'что продвинулось?',
  [ItemStatus.DONE]: 'можно не заполнять',
  [ItemStatus.BLOCKED]: 'что мешает?',
  [ItemStatus.DROPPED]: 'почему прекратили?'
}

export const STATUS_ORDER: ItemStatus[] = [
  ItemStatus.IN_PROGRESS,
  ItemStatus.DONE,
  ItemStatus.BLOCKED,
  ItemStatus.DROPPED
]
