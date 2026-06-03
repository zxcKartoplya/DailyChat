import { ApiError } from './ApiError'

export class CommonError extends ApiError {
  constructor(message: string, url: string, data?: unknown) {
    super(message, 400, url, data)
    this.name = 'CommonError'
  }
}
