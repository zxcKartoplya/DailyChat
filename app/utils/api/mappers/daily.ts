import type { Schemas } from '~/types/schemas'
import type {
  ChainPoint,
  DailyDay,
  DailyEntry,
  DayType,
  EntryItem,
  EntryStatus,
  ItemStatus,
  OffReasonOption,
  OpenChain
} from '~/types/daily'

export const mapEntryItem = (dto: Schemas['EntryItem']): EntryItem => ({
  id: dto.id,
  chainId: dto.chain_id,
  text: dto.text ?? '',
  status: dto.status as ItemStatus,
  link: dto.link ?? null,
  position: dto.position
})

export const mapEntry = (dto: Schemas['DailyEntry']): DailyEntry => ({
  id: dto.id,
  date: dto.date,
  dayType: dto.day_type as DayType,
  offReason: dto.off_reason ?? null,
  offReasonNote: dto.off_reason_note ?? null,
  status: dto.status as EntryStatus,
  submittedAt: dto.submitted_at ?? null,
  items: (dto.items ?? []).map(mapEntryItem)
})

export const mapOffReasonOption = (dto: Schemas['OffReasonOption']): OffReasonOption => ({
  code: dto.code,
  label: dto.label,
  requiresNote: dto.requires_note
})

export const mapChainPoint = (dto: Schemas['ChainPoint']): ChainPoint => ({
  date: dto.date,
  status: dto.status as ItemStatus
})

export const mapOpenChain = (dto: Schemas['OpenChain']): OpenChain => ({
  chainId: dto.chain_id,
  title: dto.title ?? '',
  lastStatus: dto.last_status as ItemStatus,
  lastText: dto.last_text ?? '',
  lastDate: dto.last_date,
  daysOpen: dto.days_open,
  link: dto.link ?? null,
  history: (dto.history ?? []).map(mapChainPoint)
})

export const mapDay = (dto: Schemas['DayView']): DailyDay => ({
  entry: dto.entry ? mapEntry(dto.entry) : null,
  openChains: (dto.open_chains ?? []).map(mapOpenChain),
  missingDays: dto.missing_days ?? [],
  editableFrom: dto.editable_from
})
