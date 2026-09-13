import type { ChainPoint } from '~/types/daily'
import { ItemStatus } from '~/types/daily'
import { daysBetween } from '~/utils/date'

export type RouteLevel = -1 | 0 | 1

export type RouteStroke = 'solid' | 'dashed'

export type RouteVertex = {
  x: number
  level: RouteLevel
}

export type RouteStation = RouteVertex & {
  date: string
  status: ItemStatus
}

export type RoutePiece = {
  from: RouteVertex
  to: RouteVertex
  stroke: RouteStroke
}

export type RoutePause = {
  from: number
  to: number
  open: boolean
}

export type RouteGeometry = {
  stations: RouteStation[]
  pieces: RoutePiece[]
  pauses: RoutePause[]
  endLevel: RouteLevel
  closed: boolean
}

export type RouteGeometryInput = {
  days: string[]
  history: ChainPoint[]
  lastDay?: ItemStatus | null
  ramp?: number
}

type RouteNode = RouteVertex & {
  status: ItemStatus
}

const ROUTE_LEVEL: Record<ItemStatus, RouteLevel> = {
  [ItemStatus.IN_PROGRESS]: 0,
  [ItemStatus.BLOCKED]: -1,
  [ItemStatus.DONE]: 1,
  [ItemStatus.DROPPED]: -1
}

const DEFAULT_RAMP = 0.35

export const routeLevel = (status: ItemStatus): RouteLevel => ROUTE_LEVEL[status]

const isClosing = (status: ItemStatus): boolean => {
  return status === ItemStatus.DONE || status === ItemStatus.DROPPED
}

const connect = (from: RouteNode, to: RouteNode, stroke: RouteStroke, ramp: number): RoutePiece[] => {
  const start = { x: from.x, level: from.level }
  const finish = { x: to.x, level: to.level }

  if (from.level === to.level) return [{ from: start, to: finish, stroke }]

  const bend = { x: Math.max(from.x, to.x - Math.min(ramp, to.x - from.x)), level: from.level }

  if (bend.x <= from.x) return [{ from: start, to: finish, stroke }]

  return [
    { from: start, to: bend, stroke },
    { from: bend, to: finish, stroke }
  ]
}

const collectPauses = (nodes: RouteNode[], end: number): RoutePause[] => {
  const pauses: RoutePause[] = []
  let pauseStart: number | null = null

  nodes.forEach((node) => {
    const blocked = node.status === ItemStatus.BLOCKED

    if (blocked && pauseStart === null) pauseStart = node.x

    if (!blocked && pauseStart !== null) {
      pauses.push({ from: pauseStart, to: node.x, open: false })
      pauseStart = null
    }
  })

  if (pauseStart !== null) pauses.push({ from: pauseStart, to: Math.max(end, pauseStart), open: true })

  return pauses
}

export const buildRouteGeometry = ({
  days,
  history,
  lastDay,
  ramp = DEFAULT_RAMP
}: RouteGeometryInput): RouteGeometry => {
  const first = days[0]
  const last = days.at(-1)

  if (!first || !last) return { stations: [], pieces: [], pauses: [], endLevel: 0, closed: false }

  const end = days.length - 1

  const byDate = new Map<string, ItemStatus>()

  history.forEach(point => byDate.set(point.date, point.status))

  if (lastDay !== undefined) byDate.delete(last)
  if (lastDay) byDate.set(last, lastDay)

  const points = [...byDate.entries()]
    .map(([date, status]) => ({ date, status }))
    .filter(point => point.date <= last)
    .sort((a, b) => a.date.localeCompare(b.date))

  const before = points.filter(point => point.date < first).at(-1)

  const stations: RouteStation[] = points
    .filter(point => point.date >= first)
    .map(point => ({
      date: point.date,
      status: point.status,
      x: daysBetween(first, point.date),
      level: routeLevel(point.status)
    }))

  const origin: RouteNode[] = before && !isClosing(before.status)
    ? [{ x: -0.5, level: routeLevel(before.status), status: before.status }]
    : []

  const nodes: RouteNode[] = [...origin, ...stations]

  const pieces = nodes.flatMap((node, index) => {
    const next = nodes[index + 1]

    if (!next || isClosing(node.status)) return []

    return connect(node, next, node.status === ItemStatus.BLOCKED ? 'dashed' : 'solid', ramp)
  })

  const tail = nodes.at(-1)

  if (tail?.status === ItemStatus.BLOCKED && tail.x < end) {
    pieces.push({
      from: { x: tail.x, level: tail.level },
      to: { x: end, level: tail.level },
      stroke: 'dashed'
    })
  }

  return {
    stations,
    pieces,
    pauses: collectPauses(nodes, end),
    endLevel: tail?.level ?? 0,
    closed: Boolean(tail && isClosing(tail.status))
  }
}
