import { useDailyApi } from '~/composables/api/useDailyApi'
import type { OffReason, OffReasonOption } from '~/types/daily'

export const useOffReasonsStore = defineStore('offReasons', () => {
  const api = useDailyApi()

  const options = ref<OffReasonOption[]>([])
  const loaded = ref(false)
  const loading = ref(false)
  const failed = ref(false)

  let request: Promise<void> | null = null

  const load = () => {
    if (loaded.value) return Promise.resolve()
    if (request) return request

    loading.value = true
    failed.value = false

    request = api.getOffReasons()
      .then((result) => {
        options.value = result
        loaded.value = true
      })
      .catch(() => {
        failed.value = true
      })
      .finally(() => {
        loading.value = false
        request = null
      })

    return request
  }

  const find = (code: OffReason | null): OffReasonOption | undefined => {
    return code ? options.value.find(option => option.code === code) : undefined
  }

  return { options, loaded, loading, failed, load, find }
})
