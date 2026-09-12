export type ThemePreference = 'light' | 'dark' | 'system'

export const useTheme = () => {
  const preference = useCookie<ThemePreference>('theme', {
    default: () => 'system',
    maxAge: 60 * 60 * 24 * 365
  })

  const isDark = () => {
    if (preference.value !== 'system') return preference.value === 'dark'
    if (import.meta.server) return false

    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const set = (value: ThemePreference) => {
    preference.value = value
  }

  const toggle = () => {
    set(isDark() ? 'light' : 'dark')
  }

  return { preference, isDark, set, toggle }
}
