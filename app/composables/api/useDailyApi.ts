import { useApi } from '~/composables/api/useApi'
import type { Schemas } from '~/types/schemas'
import type { DailyDay, DailyEntry, DayWrite, OffReasonOption } from '~/types/daily'
import { mapDay, mapEntry, mapOffReasonOption } from '~/utils/api/mappers/daily'

const dayPath = (date: string, suffix = '') => `/api/employee/daily/${date}${suffix}`

export const useDailyApi = () => {
  const { useGet, usePost, usePut } = useApi()

  const getDay = async (date: string): Promise<DailyDay> => {
    return mapDay(await useGet<Schemas['DayView']>(dayPath(date)))
  }

  const saveDay = async (date: string, day: DayWrite): Promise<DailyEntry> => {
    const payload: Schemas['DailyEntryWrite'] = {
      day_type: day.dayType,
      off_reason: day.offReason,
      off_reason_note: day.offReasonNote,
      items: day.items.map((item, position) => ({
        chain_id: item.chainId,
        text: item.text,
        status: item.status,
        link: item.link,
        position
      }))
    }

    return mapEntry(await usePut<Schemas['DailyEntry']>(dayPath(date), payload))
  }

  const submitEntry = async (date: string): Promise<DailyEntry> => {
    return mapEntry(await usePost<Schemas['DailyEntry']>(dayPath(date, '/submit')))
  }

  const markDaysOff = async (dates: string[]): Promise<DailyEntry[]> => {
    const payload: Schemas['BulkDayTypeWrite'] = { dates, day_type: 'off' }
    const entries = await usePut<Schemas['DailyEntry'][]>('/api/employee/daily-bulk', payload)

    return entries.map(mapEntry)
  }

  const getHistory = async (dateFrom?: string, dateTo?: string): Promise<DailyEntry[]> => {
    const entries = await useGet<Schemas['DailyEntry'][]>('/api/employee/daily', {
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {})
    })

    return entries.map(mapEntry)
  }

  const getOffReasons = async (): Promise<OffReasonOption[]> => {
    const options = await useGet<Schemas['OffReasonOption'][]>('/api/dictionaries/off-reasons')

    return options.map(mapOffReasonOption)
  }

  return { getDay, saveDay, submitEntry, markDaysOff, getHistory, getOffReasons }
}
