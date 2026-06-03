export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', { default: () => null })

  const logout = () => {
    token.value = null
  }

  return { token, logout }
}
