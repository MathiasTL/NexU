export type Role = 'tenant' | 'host' | 'both'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
