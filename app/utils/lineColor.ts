const LINE_COUNT = 5

export const lineColorVar = (seed: string): string => {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000
  }

  return `var(--line-${(hash % LINE_COUNT) + 1})`
}
