import { useState } from 'react'

export const usePagination = <T>(items: T[], pageSize = 10) => {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(items.length / pageSize)
  const paginated = items.slice((page - 1) * pageSize, page * pageSize)
  return { page, setPage, totalPages, paginated, total: items.length }
}
