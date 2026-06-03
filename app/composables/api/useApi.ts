import type { FetchOptions } from 'ofetch'

import type {
	ApiPaginatedResponse,
	ApiQueryType,
	ApiResponse,
	ApiSimpleResponse
} from '~/types/api'
import { ApiHttpCode } from '~/types/api'
import type { ActionResponse, Paginated } from '~/types/common'
import {
	mapPaginationLinks,
	mapPaginationMeta
} from '~/utils/api/mappers/mapBase'
import { ApiError } from '~/utils/errors/ApiError'
import { CommonError } from '~/utils/errors/CommonError'
import { NotFoundError } from '~/utils/errors/NotFoundError'
import { UnauthorizedError } from '~/utils/errors/UnauthorizedError'
import { ValidationError } from '~/utils/errors/ValidationError'

export const useApi = () => {
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
    body?: unknown,
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
    body?: unknown,
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
    body?: unknown,
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

  /**
   * Базовая обработка ответа от бэкенда
   *
   * T - тип данных в ответе от бэка
   * R - тип уже фронтовых данных возвращаемый маппером
   *
   * @param operation коллбэк, в котором и происходит запрос к бэку и маппится ответ в стейт
   * @param loading индикатор запроса. сюда передаем ref-переменную, которая будет сигнализировать что запрос еще в процессе
   * @param context строкой (на английском) что за действие будет выполнено (например 'get catalog categories')
   * @param mapper функция для маппинга
   * @throws ApiError
   */
  const handleResponse = async <T, R>(
    context: string,
    operation: () => Promise<ApiResponse<T>>,
    loading: Ref<boolean>,
    mapper: (data: T | T[]) => R = data => data as unknown as R
  ): Promise<R> => {
    loading.value = true
    try {
      const result = await operation()
      return mapper(result.data)
    } finally {
      loading.value = false
    }
  }

  const handlePaginatedResponse = async <T, R>(
    context: string,
    operation: () => Promise<ApiPaginatedResponse<T>>,
    loading: Ref<boolean>,
    mapper: (dto: T[]) => R[] = dto => dto as unknown as R[]
  ): Promise<Paginated<R>> => {
    loading.value = true
    try {
      const result = await operation()
      return {
        items: mapper(result.data),
        meta: mapPaginationMeta(result.meta),
        links: mapPaginationLinks(result.links)
      }
    } finally {
      loading.value = false
    }
  }

  // TODO: refactor to remove onSuccess and OnError
  /**
   * @deprecated use handleAction
   */
  const handleActionResponse = async (
    context: string,
    operation: () => Promise<ApiSimpleResponse>,
    loading: Ref<boolean>,
    handlers?: {
      onSuccess?: (message: string) => Promise<void>
      onError?: (error: ApiError) => Promise<void>
    }
  ): Promise<ActionResponse> => {
    try {
      loading.value = true

      const result = await operation()

      if (
        result.success === true
        && typeof handlers?.onSuccess === 'function'
      ) {
        await handlers.onSuccess(result.message ?? '')
      }

      if (result.success === false && typeof handlers?.onError === 'function') {
        await handlers.onError(
          new ApiError(result.error ?? 'Неизвестная ошибка', 201)
        )
      }

      return {
        success: result.success,
        code: 200,
        ...(result.message && { messages: result.message }),
        ...(result.error && { error: result.error })
      } as ActionResponse
    } catch (error: unknown) {
      // Error already processed by onResponseError as ApiError
      if (
        typeof handlers?.onError === 'function'
        && error instanceof ApiError
      ) {
        await handlers.onError(error)
      }

      // FIXME
      return {
        success: false,
        code:
          error instanceof ApiError && error.code
            ? error.code
            : ApiHttpCode.SERVER_ERROR,
        error: error instanceof ApiError ? error.message : String(error)
      } as ActionResponse
    } finally {
      loading.value = false
    }
  }

  /**
   * TODO: loggin context when debug is on
   * TODO: handleAction to universal handleResponse
   */
  function handleAction<T, R>(
    context: string,
    operation: () => Promise<ApiResponse<T>>,
    loading: Ref<boolean>,
    mapper: (data: T | T[]) => R
  ): Promise<R | null>

  function handleAction<T>(
    context: string,
    operation: () => Promise<ApiResponse<T>>,
    loading: Ref<boolean>
  ): Promise<T | null>

  async function handleAction<T, R = T>(
    context: string,
    operation: () => Promise<ApiResponse<T>>,
    loading: Ref<boolean>,
    mapper?: (data: T | T[]) => R
  ): Promise<R | T | null> {
    try {
      loading.value = true

      const result = await operation()

      if (!result.data) {
        return null
      }

      if (mapper) {
        return mapper(result.data)
      }

      return result.data
    } finally {
      loading.value = false
    }
  }

  const buildOptions = (options: FetchOptions = {}): FetchOptions => {
    const { headers, ...requestOptions } = options

    const defaultHeaders = {
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
      onRequestError: ({ request, options, error }) => {
        console.error('[fetch request error]', request, options, error)
      },
      onResponseError: async ({ response, options, request }) => {
        // TODO: disable log on production
        console.warn('onResponseError', { response, options, request })

        if (!response) {
          throw new ApiError('Unknown', ApiHttpCode.SERVER_ERROR)
        }

        const msg: string
          = response._data?.error || response._data?.message || 'Unknown'

        switch (response.status) {
          case ApiHttpCode.UNAUTHORIZED:
            throw new UnauthorizedError()
          case ApiHttpCode.VALIDATION_ERROR:
            throw new ValidationError(
              msg,
              (response._data?.errors as Record<string, string | string[]>)
              ?? {}
            )
          case ApiHttpCode.COMMON_ERROR:
            throw new CommonError(
              msg,
              response.url || 'undefined',
              response._data
            )
          case ApiHttpCode.NOT_FOUND:
            throw new NotFoundError(
              msg,
              response.url || 'undefined',
              response._data
            )

            // TODO: other error codes

          default:
            throw new ApiError(
              msg,
              response.status || ApiHttpCode.SERVER_ERROR,
              response.url || 'undefined',
              response._data
            )
        }
      },
      ...requestOptions
    }
  }

  const getAuthHeaders = () => {
    const { token } = useAuth()

    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
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
    useDelete,
    handleResponse,
    handlePaginatedResponse,
    handleActionResponse,
    handleAction
  }
}
