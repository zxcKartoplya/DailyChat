import { ApiError } from './ApiError'

export class NotFoundError extends ApiError {
  constructor(message: string, url: string, data?: unknown) {
    super(message, 404, url, data)
    this.name = 'NotFoundError'
  }
}
