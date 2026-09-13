const LOGIN_PATH = '/login'

export default defineNuxtRouteMiddleware((to) => {
  const { token } = useAuth()

  if (!token.value && to.path !== LOGIN_PATH) {
    return navigateTo(LOGIN_PATH)
  }

  if (token.value && to.path === LOGIN_PATH) {
    return navigateTo('/')
  }
})
