export type ActionResponse = {
  success: boolean
  code: number
  messages?: string
  error?: string
}

export type PaginationMeta = {
  currentPage: number
  from: number
  lastPage: number
  perPage: number
  to: number
  total: number
}

export type PaginationLinks = {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export type Paginated<T> = {
  items: T[]
  meta: PaginationMeta
  links: PaginationLinks
}
