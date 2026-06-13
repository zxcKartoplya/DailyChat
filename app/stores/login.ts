import { useLoginApi } from '~/composables/api/useLoginApi'
import type { loginUser } from '~/types/login'

export const useLoginStore = defineStore('login', () => {
  const { postLoginUser } = useLoginApi()

  const loginUser = async (form: loginUser) => {
    await postLoginUser(form)
  }

  return { loginUser }
})
