import { ApiError } from './ApiError'

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public readonly errors: Record<string, string | string[]>
  ) {
    super(message, 422)
    this.name = 'ValidationError'
  }
}
