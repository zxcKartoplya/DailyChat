type CardKeyboardOptions = {
  enabled: () => boolean
  onToggle: (index: number) => void
  onDigit: (index: number, position: number) => void
  onSubmit: () => void
  onUndo: () => void
}

const CARD_SELECTOR = '[data-card]'

const isTextEntry = (node: HTMLElement) => {
  return node.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName)
}

const isDigit = (key: string) => key.length === 1 && key >= '1' && key <= '9'

export const useCardKeyboard = (options: CardKeyboardOptions) => {
  const cardsOf = (container: HTMLElement) => {
    return Array.from(container.querySelectorAll<HTMLElement>(CARD_SELECTOR))
  }

  const focusShift = (container: HTMLElement, card: HTMLElement, offset: number) => {
    const cards = cardsOf(container)
    const index = cards.indexOf(card)

    if (index < 0) return

    cards[(index + offset + cards.length) % cards.length]?.focus()
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (!options.enabled()) return

    const { target, currentTarget } = event

    if (!(target instanceof HTMLElement) || !(currentTarget instanceof HTMLElement)) return

    const card = target.closest<HTMLElement>(CARD_SELECTOR)

    if (!card) return

    if (isTextEntry(target)) {
      if (event.key !== 'Escape') return

      event.preventDefault()
      card.focus()

      return
    }

    if (event.metaKey || event.ctrlKey || event.altKey) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusShift(currentTarget, card, event.key === 'ArrowDown' ? 1 : -1)

      return
    }

    if (target !== card) return

    const index = cardsOf(currentTarget).indexOf(card)

    if (index < 0) return

    if (event.key === ' ') {
      event.preventDefault()
      options.onToggle(index)

      return
    }

    if (!isDigit(event.key)) return

    event.preventDefault()
    options.onDigit(index, Number(event.key) - 1)
  }

  const onPageKeydown = (event: KeyboardEvent) => {
    if (!(event.metaKey || event.ctrlKey) || !options.enabled()) return

    if (event.key === 'Enter') {
      event.preventDefault()
      options.onSubmit()

      return
    }

    if (event.key.toLowerCase() !== 'z' || event.shiftKey) return
    if (event.target instanceof HTMLElement && isTextEntry(event.target)) return

    event.preventDefault()
    options.onUndo()
  }

  onMounted(() => window.addEventListener('keydown', onPageKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onPageKeydown))

  return { onKeydown }
}
