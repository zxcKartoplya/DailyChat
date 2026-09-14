import type { ActivityChain } from '~/types/activity'
import type { DailyEntry, ItemStatus } from '~/types/daily'
import { daysRange, shiftDays } from '~/utils/date'
import { buildRouteGeometry } from '~/utils/routeGeometry'

export const WEEK_DAYS = 7

export type HistoryNote = {
  id: number
  date: string
  status: ItemStatus
  text: string
  link: string | null
}

export type HistoryRow = {
  chain: ActivityChain
  notes: HistoryNote[]
}

export type HistoryDay = {
  date: string
  entry: DailyEntry | null
}

export type HistoryWeek = {
  key: string
  days: HistoryDay[]
  rows: HistoryRow[]
}

export type HistoryTimelineInput = {
  dateFrom: string
  dateTo: string
  chains: ActivityChain[]
  entries: DailyEntry[]
}

export const splitWeeks = (dateFrom: string, dateTo: string): string[][] => {
  const weeks: string[][] = []
  let end = dateTo

  while (end >= dateFrom) {
    const candidate = shiftDays(end, 1 - WEEK_DAYS)
    const start = candidate < dateFrom ? dateFrom : candidate

    weeks.push(daysRange(start, end))
    end = shiftDays(start, -1)
  }

  return weeks
}

const collectNotes = (entries: DailyEntry[]): Map<string, HistoryNote[]> => {
  const notes = new Map<string, HistoryNote[]>()

  const ordered = [...entries].sort((a, b) => a.date.localeCompare(b.date))

  ordered.forEach((entry) => {
    const items = [...entry.items].sort((a, b) => a.position - b.position)

    items.forEach((item) => {
      if (!item.chainId) return

      const list = notes.get(item.chainId) ?? []

      list.push({ id: item.id, date: entry.date, status: item.status, text: item.text, link: item.link })
      notes.set(item.chainId, list)
    })
  })

  return notes
}

const isOnTrack = (chain: ActivityChain, days: string[]): boolean => {
  const geometry = buildRouteGeometry({ days, history: chain.history })

  return geometry.stations.length > 0 || geometry.pieces.length > 0
}

export const buildHistoryWeeks = ({ dateFrom, dateTo, chains, entries }: HistoryTimelineInput): HistoryWeek[] => {
  const entryByDate = new Map(entries.map(entry => [entry.date, entry]))
  const notes = collectNotes(entries)

  const ordered = [...chains].sort((a, b) => {
    return a.firstDate.localeCompare(b.firstDate) || a.chainId.localeCompare(b.chainId)
  })

  return splitWeeks(dateFrom, dateTo).map((dates) => {
    const first = dates[0] ?? dateFrom
    const last = dates.at(-1) ?? dateTo

    const rows = ordered
      .filter(chain => isOnTrack(chain, dates))
      .map(chain => ({
        chain,
        notes: (notes.get(chain.chainId) ?? []).filter(note => note.date >= first && note.date <= last)
      }))

    return {
      key: `${first}:${last}`,
      days: dates.map(date => ({ date, entry: entryByDate.get(date) ?? null })),
      rows
    }
  })
}
