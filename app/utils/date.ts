const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
]

const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const fromIsoDate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number)

  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

export const shiftDays = (iso: string, days: number): string => {
  const date = fromIsoDate(iso)
  date.setDate(date.getDate() + days)

  return toIsoDate(date)
}

export const todayIso = (): string => toIsoDate(new Date())

export const formatLongDate = (iso: string): string => {
  const date = fromIsoDate(iso)

  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`
}

export const formatDayNumber = (iso: string): string => String(fromIsoDate(iso).getDate())

export const formatWeekday = (iso: string): string => WEEKDAYS_SHORT[fromIsoDate(iso).getDay()] ?? ''

export const isWeekend = (iso: string): boolean => {
  const day = fromIsoDate(iso).getDay()

  return day === 0 || day === 6
}

export const relativeDayLabel = (iso: string, today = todayIso()): string => {
  if (iso === today) return 'сегодня'
  if (iso === shiftDays(today, -1)) return 'вчера'

  return formatLongDate(iso)
}

export const formatDateList = (isoDates: string[]): string => {
  if (!isoDates.length) return ''

  const parts = isoDates.map(formatLongDate)
  const sameMonth = new Set(isoDates.map(iso => fromIsoDate(iso).getMonth())).size === 1

  const readable = sameMonth
    ? isoDates.map((iso, index) => (index === isoDates.length - 1 ? formatLongDate(iso) : formatDayNumber(iso)))
    : parts

  if (readable.length === 1) return readable[0] as string

  return `${readable.slice(0, -1).join(', ')} и ${readable.at(-1)}`
}

export const daysBetween = (fromIso: string, toIso: string): number => {
  const diff = fromIsoDate(toIso).getTime() - fromIsoDate(fromIso).getTime()

  return Math.round(diff / 86400000)
}

export const lastDays = (count: number, endIso = todayIso()): string[] => {
  return Array.from({ length: count }, (_, index) => shiftDays(endIso, index - count + 1))
}
