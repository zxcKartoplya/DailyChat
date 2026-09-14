export type UndoOffer = {
  title: string
  restore: () => void
}

export const UNDO_TTL = 8000

export const useUndoStore = defineStore('undo', () => {
  const offer = shallowRef<UndoOffer | null>(null)

  let timer: ReturnType<typeof setTimeout> | null = null

  const cancelTimer = () => {
    if (!timer) return

    clearTimeout(timer)
    timer = null
  }

  const forget = () => {
    cancelTimer()
    offer.value = null
  }

  const propose = (value: UndoOffer) => {
    cancelTimer()
    offer.value = value
    timer = setTimeout(forget, UNDO_TTL)
  }

  const run = () => {
    const current = offer.value

    if (!current) return

    forget()
    current.restore()
  }

  return { offer, propose, forget, run }
})
