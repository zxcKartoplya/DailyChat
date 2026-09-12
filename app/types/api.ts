export enum ApiHttpCode {
  UNAUTHORIZED = 401,
  VALIDATION_ERROR = 422,
  COMMON_ERROR = 400,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

export type ApiQueryType = string | number | boolean
