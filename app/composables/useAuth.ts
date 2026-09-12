export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', { default: () => null })

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const logout = () => {
    token.value = null
  }

  return { logout, setToken, token }
}
