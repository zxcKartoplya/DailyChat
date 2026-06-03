export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly url?: string,
    public readonly data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
