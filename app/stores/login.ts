import { useLoginApi } from '~/composables/api/useLoginApi'
import type { loginUser } from '~/types/login'

export const useLoginStore = defineStore('login', () => {
  const { postLoginUser } = useLoginApi()
  const { setToken } = useAuth()

  const loginUser = async (form: loginUser) => {
    const { access_token: accessToken } = await postLoginUser(form)

    setToken(accessToken)
  }

  return { loginUser }
})
