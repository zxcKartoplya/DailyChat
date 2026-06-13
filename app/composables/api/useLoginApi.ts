import { useApi } from '~/composables/api/useApi'
import type { loginUser } from '~/types/login'

export const useLoginApi = () => {
  const { usePost } = useApi()

  const postLoginUser = async (form: loginUser) => {
    return await usePost('api/auth/login', form)
  }
  return { postLoginUser }
}
