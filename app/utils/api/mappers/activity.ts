import type { Schemas } from '~/types/schemas'
import type {
  ActivityChain,
  ActivityPeriod,
  ActivitySummary,
  ChainOutcome,
  EmployeeActivity
} from '~/types/activity'
import type { ItemStatus } from '~/types/daily'
import { mapChainPoint } from '~/utils/api/mappers/daily'

export const mapActivitySummary = (dto: Schemas['ActivitySummary']): ActivitySummary => ({
  chainsCount: dto.chains_count,
  startedCount: dto.started_count,
  doneCount: dto.done_count,
  droppedCount: dto.dropped_count,
  openCount: dto.open_count,
  blockedChainsCount: dto.blocked_chains_count,
  blockedDays: dto.blocked_days,
  avgDaysToDone: dto.avg_days_to_done ?? null
})

export const mapActivityChain = (dto: Schemas['ActivityChain']): ActivityChain => ({
  chainId: dto.chain_id,
  title: dto.title ?? '',
  link: dto.link ?? null,
  firstDate: dto.first_date,
  lastDate: dto.last_date,
  closedDate: dto.closed_date ?? null,
  daysTotal: dto.days_total,
  blockedDays: dto.blocked_days,
  lastStatus: dto.last_status as ItemStatus,
  outcome: dto.outcome as ChainOutcome,
  startedInPeriod: dto.started_in_period,
  closedInPeriod: dto.closed_in_period,
  history: (dto.history ?? []).map(mapChainPoint)
})

export const mapEmployeeActivity = (dto: Schemas['EmployeeActivity']): EmployeeActivity => ({
  period: dto.period as ActivityPeriod,
  dateFrom: dto.date_from,
  dateTo: dto.date_to,
  summary: mapActivitySummary(dto.summary),
  chains: (dto.chains ?? []).map(mapActivityChain)
})
