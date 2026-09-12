import { useApi } from '~/composables/api/useApi'
import type { ApiAuthorization } from '~/types/api/login'
import type { loginUser } from '~/types/login'

export const useLoginApi = () => {
  const { usePost } = useApi()

  const postLoginUser = async (form: loginUser): Promise<ApiAuthorization> => {
    return await usePost('/api/auth/login', form)
  }
  return { postLoginUser }
}
