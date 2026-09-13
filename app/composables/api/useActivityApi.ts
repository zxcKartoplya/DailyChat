import { useApi } from '~/composables/api/useApi'
import type { Schemas } from '~/types/schemas'
import type { ActivityPeriod, EmployeeActivity } from '~/types/activity'
import { mapEmployeeActivity } from '~/utils/api/mappers/activity'

export const useActivityApi = () => {
  const { useGet } = useApi()

  const getActivity = async (period: ActivityPeriod, date?: string): Promise<EmployeeActivity> => {
    const activity = await useGet<Schemas['EmployeeActivity']>('/api/employee/activity', {
      period,
      ...(date ? { date } : {})
    })

    return mapEmployeeActivity(activity)
  }

  return { getActivity }
}
