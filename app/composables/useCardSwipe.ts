import { ItemStatus } from '~/types/daily'

export type SwipeIntent = ItemStatus.DONE | ItemStatus.IN_PROGRESS | ItemStatus.BLOCKED

type CardSwipeOptions = {
  enabled: () => boolean
  onCommit: (intent: SwipeIntent) => void
}

type SwipePhase = 'idle' | 'deciding' | 'dragging'

const SLOP_REM = 0.5
const EDGE_REM = 1
const SHORT_RATIO = 0.25
const SHORT_MIN_REM = 4
const LONG_RATIO = 0.5
const LONG_MIN_REM = 9
const OVERSHOOT_REM = 2
const RESISTANCE = 0.3
const CLICK_GUARD_MS = 400
const NO_SWIPE_SELECTOR = 'input, textarea, select, [contenteditable], [role="radiogroup"]'

const rootRem = () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16

export const useCardSwipe = (element: Ref<HTMLElement | null>, options: CardSwipeOptions) => {
  const offset = ref(0)
  const intent = ref<SwipeIntent | null>(null)
  const dragging = ref(false)

  let phase: SwipePhase = 'idle'
  let pointerId: number | null = null
  let startX = 0
  let startY = 0
  let rem = 16
  let shortDistance = 0
  let longDistance = 0
  let clickGuard: ReturnType<typeof setTimeout> | null = null

  const reset = () => {
    phase = 'idle'
    pointerId = null
    offset.value = 0
    intent.value = null
    dragging.value = false
  }

  const resist = (distance: number) => {
    const limit = longDistance + OVERSHOOT_REM * rem
    const size = Math.abs(distance)

    if (size <= limit) return distance

    return Math.sign(distance) * (limit + (size - limit) * RESISTANCE)
  }

  const intentFor = (distance: number): SwipeIntent | null => {
    if (distance <= -shortDistance) return ItemStatus.DONE
    if (distance >= longDistance) return ItemStatus.BLOCKED
    if (distance >= shortDistance) return ItemStatus.IN_PROGRESS

    return null
  }

  const releaseClickGuard = () => {
    if (!clickGuard) return

    clearTimeout(clickGuard)
    clickGuard = null
  }

  const armClickGuard = () => {
    releaseClickGuard()
    clickGuard = setTimeout(releaseClickGuard, CLICK_GUARD_MS)
  }

  const startsInEdge = (x: number) => {
    const edge = EDGE_REM * rem

    return x < edge || x > window.innerWidth - edge
  }

  const onPointerDown = (event: PointerEvent) => {
    releaseClickGuard()

    if (phase !== 'idle') {
      reset()

      return
    }

    const card = element.value

    if (!card || event.pointerType === 'mouse' || !event.isPrimary || !options.enabled()) return
    if (event.target instanceof Element && event.target.closest(NO_SWIPE_SELECTOR)) return

    rem = rootRem()

    if (startsInEdge(event.clientX)) return

    const width = card.offsetWidth

    shortDistance = Math.max(width * SHORT_RATIO, SHORT_MIN_REM * rem)
    longDistance = Math.max(width * LONG_RATIO, LONG_MIN_REM * rem)
    phase = 'deciding'
    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return

    const dx = event.clientX - startX
    const dy = event.clientY - startY

    if (phase === 'deciding') {
      if (Math.hypot(dx, dy) < SLOP_REM * rem) return

      if (Math.abs(dx) <= Math.abs(dy)) {
        reset()

        return
      }

      phase = 'dragging'
      dragging.value = true
      element.value?.setPointerCapture(event.pointerId)
    }

    offset.value = resist(dx)
    intent.value = intentFor(offset.value)
  }

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return

    if (phase !== 'dragging') {
      reset()

      return
    }

    const committed = intent.value

    reset()
    armClickGuard()

    if (committed) options.onCommit(committed)
  }

  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return

    reset()
  }

  const onClickCapture = (event: MouseEvent) => {
    if (!clickGuard) return

    event.preventDefault()
    event.stopPropagation()
    releaseClickGuard()
  }

  let bound: HTMLElement | null = null

  onMounted(() => {
    bound = element.value

    bound?.addEventListener('pointerdown', onPointerDown)
    bound?.addEventListener('pointermove', onPointerMove)
    bound?.addEventListener('pointerup', onPointerUp)
    bound?.addEventListener('pointercancel', onPointerCancel)
    bound?.addEventListener('click', onClickCapture, true)
  })

  onBeforeUnmount(() => {
    releaseClickGuard()

    bound?.removeEventListener('pointerdown', onPointerDown)
    bound?.removeEventListener('pointermove', onPointerMove)
    bound?.removeEventListener('pointerup', onPointerUp)
    bound?.removeEventListener('pointercancel', onPointerCancel)
    bound?.removeEventListener('click', onClickCapture, true)
    bound = null
  })

  return { offset, intent, dragging }
}
