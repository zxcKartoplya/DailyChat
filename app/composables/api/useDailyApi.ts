import type { DailyDay, DailyEntry, DayType, DraftItem } from '~/types/daily'
import { mockDay, mockHistory } from '~/utils/mocks/daily'

const MOCK_LATENCY = 320

const delay = <T>(value: T, ms = MOCK_LATENCY): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

const entryPath = (entryId: number, suffix = '') => `/daily/${entryId}${suffix}`

export const useDailyApi = () => {
  const getDay = async (date: string): Promise<DailyDay> => {
    return delay(mockDay(date))
  }

  const saveItems = async (entryId: number, items: DraftItem[]): Promise<void> => {
    await delay({ path: entryPath(entryId, '/items'), items }, 220)
  }

  const submitEntry = async (entryId: number): Promise<string> => {
    const sent = await delay({ path: entryPath(entryId, '/submit'), at: new Date().toISOString() })

    return sent.at
  }

  const setDayType = async (entryId: number, dayType: DayType): Promise<void> => {
    await delay({ path: entryPath(entryId), dayType }, 200)
  }

  const getHistory = async (): Promise<DailyEntry[]> => {
    return delay(mockHistory())
  }

  return { getDay, saveItems, submitEntry, setDayType, getHistory }
}
