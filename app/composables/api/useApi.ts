import type { FetchOptions } from 'ofetch'

import type { NuxtApp } from '#app'
import type { ApiQueryType } from '~/types/api'
import { ApiHttpCode } from '~/types/api'
import { ApiError } from '~/utils/errors/ApiError'
import { CommonError } from '~/utils/errors/CommonError'
import { NotFoundError } from '~/utils/errors/NotFoundError'
import { UnauthorizedError } from '~/utils/errors/UnauthorizedError'
import { ValidationError } from '~/utils/errors/ValidationError'
import { isLoginPath, loginLocation } from '~/utils/session'

type RequestBody = FetchOptions['body']

const sessionEnds = new WeakMap<NuxtApp, Promise<void>>()

type ValidationIssue = {
  loc?: (string | number)[]
  msg?: string
}

const issueField = (issue: ValidationIssue) => {
  const path = issue.loc ?? []

  return String(path[path.length - 1] ?? 'form')
}

const errorText = (payload: unknown, fallback: string): string => {
  const detail = (payload as { detail?: unknown })?.detail

  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) return (detail[0] as ValidationIssue)?.msg ?? fallback

  return fallback
}

const validationFields = (payload: unknown): Record<string, string> => {
  const detail = (payload as { detail?: unknown })?.detail

  if (!Array.isArray(detail)) return {}

  return Object.fromEntries(
    (detail as ValidationIssue[]).map(issue => [issueField(issue), issue.msg ?? 'Некорректное значение'])
  )
}

export const useApi = () => {
  const nuxtApp = useNuxtApp()
  const router = useRouter()
  // originally from .env API_URL
  const baseURL = useRuntimeConfig().public.apiUrl
  const cookieHeader = import.meta.server
    ? useRequestHeaders(['cookie']).cookie
    : null

  const useGet = async <T>(
    path: string,
    query?: Record<string, ApiQueryType | ApiQueryType[]>,
    options: FetchOptions = {}
  ) => {
    return $fetch<T>(buildUrl(path), {
      ...buildOptions(options),
      method: 'GET',
      query
    })
  }

  const usePost = async <T>(
    path: string,
    body?: RequestBody,
    options: FetchOptions = {}
  ) => {
    return $fetch<T>(buildUrl(path), {
      ...buildOptions(options),
      method: 'POST',
      body
    })
  }

  const usePut = async <T>(
    path: string,
    body?: RequestBody,
    options: FetchOptions = {}
  ) => {
    return $fetch<T>(buildUrl(path), {
      ...buildOptions(options),
      method: 'PUT',
      body
    })
  }

  const usePatch = async <T>(
    path: string,
    body?: RequestBody,
    options: FetchOptions = {}
  ) => {
    return $fetch<T>(buildUrl(path), {
      ...buildOptions(options),
      method: 'PATCH',
      body
    })
  }

  const useDelete = async <T>(path: string, options: FetchOptions = {}) => {
    return $fetch<T>(buildUrl(path), {
      ...buildOptions(options),
      method: 'DELETE'
    })
  }

  const buildOptions = (options: FetchOptions = {}): FetchOptions => {
    const { headers, ...requestOptions } = options

    const defaultHeaders: Record<string, string> = {
      Accept: 'application/json'
    }

    if (cookieHeader) {
      defaultHeaders['Cookie'] = cookieHeader
    }

    return {
      baseURL,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...getAuthHeaders(),
        ...headers
      },
      onResponseError: async ({ response }) => {
        if (!response) {
          throw new ApiError('Сервер недоступен', ApiHttpCode.SERVER_ERROR)
        }

        const url = response.url || 'undefined'

        switch (response.status) {
          case ApiHttpCode.UNAUTHORIZED:
            await endSession()
            throw new UnauthorizedError()
          case ApiHttpCode.VALIDATION_ERROR:
            throw new ValidationError(
              errorText(response._data, 'Некорректные данные'),
              validationFields(response._data)
            )
          case ApiHttpCode.COMMON_ERROR:
            throw new CommonError(
              errorText(response._data, 'Запрос отклонён'),
              url,
              response._data
            )
          case ApiHttpCode.NOT_FOUND:
            throw new NotFoundError(
              errorText(response._data, 'Не найдено'),
              url,
              response._data
            )
          default:
            throw new ApiError(
              errorText(response._data, `Ошибка запроса (${response.status})`),
              response.status || ApiHttpCode.SERVER_ERROR,
              url,
              response._data
            )
        }
      },
      ...requestOptions
    }
  }

  const getAuthHeaders = (): Record<string, string> => {
    const { token } = useAuth()

    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  const leaveToLogin = async () => {
    const { path, fullPath } = router.currentRoute.value

    if (isLoginPath(path)) return

    await nuxtApp.runWithContext(() => {
      useAuth().logout()

      return navigateTo(loginLocation(fullPath), { replace: true })
    })
  }

  const endSession = (): Promise<void> => {
    const pending = sessionEnds.get(nuxtApp)

    if (pending) return pending

    const leaving = leaveToLogin().finally(() => {
      sessionEnds.delete(nuxtApp)
    })

    sessionEnds.set(nuxtApp, leaving)

    return leaving
  }

  const buildUrl = (path: string): string => {
    return (
      (baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL)
      + (path.startsWith('/') ? path : `/${path}`)
    )
  }

  return {
    useGet,
    usePost,
    usePut,
    usePatch,
    useDelete
  }
}
