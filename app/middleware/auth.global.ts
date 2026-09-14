import { isLoginPath, loginLocation, safeRedirect } from '~/utils/session'

export default defineNuxtRouteMiddleware((to) => {
  const { token } = useAuth()
  const isLogin = isLoginPath(to.path)

  if (!token.value && !isLogin) {
    return navigateTo(loginLocation(to.fullPath))
  }

  if (token.value && isLogin) {
    return navigateTo(safeRedirect(to.query.redirect))
  }
})
