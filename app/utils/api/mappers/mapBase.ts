import type { ApiPaginatedResponse } from '~/types/api'
import type { PaginationLinks, PaginationMeta } from '~/types/common'

export const mapPaginationMeta = (
  meta: ApiPaginatedResponse<unknown>['meta']
): PaginationMeta => ({
  currentPage: meta.current_page,
  from: meta.from,
  lastPage: meta.last_page,
  perPage: meta.per_page,
  to: meta.to,
  total: meta.total
})

export const mapPaginationLinks = (
  links: ApiPaginatedResponse<unknown>['links']
): PaginationLinks => ({
  first: links.first,
  last: links.last,
  prev: links.prev,
  next: links.next
})
