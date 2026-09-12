import type { ChainPoint, DailyDay, DailyEntry, OpenChain } from '~/types/daily'
import { DayType, EntryStatus, ItemStatus } from '~/types/daily'
import { shiftDays, todayIso } from '~/utils/date'

const point = (date: string, status: ItemStatus): ChainPoint => ({ date, status })

export const mockDay = (date: string): DailyDay => {
  const today = todayIso()

  const openChains: OpenChain[] = [
    {
      chainId: 'c3d4-otchetnost',
      title: 'перенос отчётности на новый шаблон',
      lastStatus: ItemStatus.BLOCKED,
      lastText: 'выгрузка за прошлый год не сходится, жду архив от Ивана',
      lastDate: shiftDays(date, -1),
      daysOpen: 4,
      link: null,
      history: [
        point(shiftDays(date, -4), ItemStatus.IN_PROGRESS),
        point(shiftDays(date, -3), ItemStatus.IN_PROGRESS),
        point(shiftDays(date, -1), ItemStatus.BLOCKED)
      ]
    },
    {
      chainId: 'f7a2-podryadchik',
      title: 'согласование договора с подрядчиком',
      lastStatus: ItemStatus.IN_PROGRESS,
      lastText: 'отправил на юридическую проверку',
      lastDate: shiftDays(date, -3),
      daysOpen: 8,
      link: null,
      history: [
        point(shiftDays(date, -8), ItemStatus.IN_PROGRESS),
        point(shiftDays(date, -6), ItemStatus.IN_PROGRESS),
        point(shiftDays(date, -3), ItemStatus.IN_PROGRESS)
      ]
    },
    {
      chainId: 'b1e9-zayavki',
      title: 'разбор заявок из поддержки за август',
      lastStatus: ItemStatus.IN_PROGRESS,
      lastText: 'прошёл половину списка',
      lastDate: shiftDays(date, -1),
      daysOpen: 2,
      link: null,
      history: [
        point(shiftDays(date, -2), ItemStatus.IN_PROGRESS),
        point(shiftDays(date, -1), ItemStatus.IN_PROGRESS)
      ]
    }
  ]

  const entry: DailyEntry = {
    id: 128,
    date,
    dayType: DayType.WORK,
    status: EntryStatus.DRAFT,
    submittedAt: null,
    items: []
  }

  return {
    entry,
    openChains,
    missingDays: date === today ? [shiftDays(date, -2)] : [],
    editableFrom: shiftDays(date, -7)
  }
}

export const mockHistory = (): DailyEntry[] => {
  const today = todayIso()

  return [
    {
      id: 127,
      date: shiftDays(today, -1),
      dayType: DayType.WORK,
      status: EntryStatus.SUBMITTED,
      submittedAt: `${shiftDays(today, -1)}T18:42:00`,
      items: [
        {
          id: 501,
          chainId: 'c3d4-otchetnost',
          text: 'выгрузка за прошлый год не сходится, жду архив от Ивана',
          status: ItemStatus.BLOCKED,
          link: null,
          position: 0
        },
        {
          id: 502,
          chainId: 'b1e9-zayavki',
          text: 'прошёл половину списка',
          status: ItemStatus.IN_PROGRESS,
          link: null,
          position: 1
        }
      ]
    },
    {
      id: 126,
      date: shiftDays(today, -3),
      dayType: DayType.WORK,
      status: EntryStatus.SUBMITTED,
      submittedAt: `${shiftDays(today, -3)}T19:05:00`,
      items: [
        {
          id: 498,
          chainId: 'f7a2-podryadchik',
          text: 'отправил на юридическую проверку',
          status: ItemStatus.IN_PROGRESS,
          link: null,
          position: 0
        },
        {
          id: 499,
          chainId: 'c3d4-otchetnost',
          text: 'перенёс справочники и первые три отчёта',
          status: ItemStatus.IN_PROGRESS,
          link: null,
          position: 1
        },
        {
          id: 500,
          chainId: 'a5c1-onboarding',
          text: 'закончил вводную для нового аналитика',
          status: ItemStatus.DONE,
          link: null,
          position: 2
        }
      ]
    },
    {
      id: 125,
      date: shiftDays(today, -4),
      dayType: DayType.OFF,
      status: EntryStatus.SUBMITTED,
      submittedAt: `${shiftDays(today, -4)}T09:12:00`,
      items: []
    }
  ]
}
