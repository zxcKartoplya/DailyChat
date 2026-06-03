export enum ApiHttpCode {
  UNAUTHORIZED = 401,
  VALIDATION_ERROR = 422,
  COMMON_ERROR = 400,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

export type ApiQueryType = string | number | boolean

export type ApiResponse<T> = {
  data: T | T[]
}

export type ApiPaginatedResponse<T> = {
  data: T[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export type ApiSimpleResponse = {
  success: boolean
  message?: string
  error?: string
}
