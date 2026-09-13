const TOKEN_MAX_AGE = 60 * 60 * 24 * 7

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    path: '/',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE
  })

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const logout = () => {
    token.value = null
  }

  return { logout, setToken, token }
}
