import { ApiError } from './ApiError'

export class UnauthorizedError extends ApiError {
  constructor() {
    super('Unauthorized', 401)
    this.name = 'UnauthorizedError'
  }
}
