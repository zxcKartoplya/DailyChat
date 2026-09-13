import type { ChainPoint, ItemStatus } from '~/types/daily'

export enum ActivityPeriod {
  WEEK = 'week',
  MONTH = 'month'
}

export enum ChainOutcome {
  OPEN = 'open',
  DONE = 'done',
  DROPPED = 'dropped'
}

export type ActivitySummary = {
  chainsCount: number
  startedCount: number
  doneCount: number
  droppedCount: number
  openCount: number
  blockedChainsCount: number
  blockedDays: number
  avgDaysToDone: number | null
}

export type ActivityChain = {
  chainId: string
  title: string
  link: string | null
  firstDate: string
  lastDate: string
  closedDate: string | null
  daysTotal: number
  blockedDays: number
  lastStatus: ItemStatus
  outcome: ChainOutcome
  startedInPeriod: boolean
  closedInPeriod: boolean
  history: ChainPoint[]
}

export type EmployeeActivity = {
  period: ActivityPeriod
  dateFrom: string
  dateTo: string
  summary: ActivitySummary
  chains: ActivityChain[]
}
