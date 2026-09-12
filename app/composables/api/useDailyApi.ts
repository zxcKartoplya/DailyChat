import { useApi } from '~/composables/api/useApi'
import type { Schemas } from '~/types/schemas'
import type { DailyDay, DailyEntry, DayType, DraftItem } from '~/types/daily'
import { mapDay, mapEntry } from '~/utils/api/mappers/daily'

const dayPath = (date: string, suffix = '') => `/api/employee/daily/${date}${suffix}`

export const useDailyApi = () => {
  const { useGet, usePost, usePut } = useApi()

  const getDay = async (date: string): Promise<DailyDay> => {
    return mapDay(await useGet<Schemas['DayView']>(dayPath(date)))
  }

  const saveDay = async (date: string, dayType: DayType, items: DraftItem[]): Promise<DailyEntry> => {
    const payload: Schemas['DailyEntryWrite'] = {
      day_type: dayType,
      items: items.map((item, position) => ({
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

  return { getDay, saveDay, submitEntry, markDaysOff, getHistory }
}
