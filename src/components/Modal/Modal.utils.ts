import { useState } from "react"
import { usePrevious } from "react-use"

export const usePagination = (initial = 0) => {
  const [page, setPage] = useState(initial)
  const previous = usePrevious(page)

  const direction = (previous ?? initial) < page ? 1 : -1

  const paginate = (direction: number) => setPage((prev) => prev + direction)

  const next = () => paginate(1)
  const back = () => paginate(-1)
  const reset = () => setPage(0)
  const paginateTo = (page: number) => setPage(page)

  return [
    { page, direction },
    { paginate, next, back, reset, paginateTo },
  ] as const
}
