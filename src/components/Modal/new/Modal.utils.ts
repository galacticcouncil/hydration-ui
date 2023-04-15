import { useState } from "react"
import { usePrevious } from "react-use"

export const usePagination = (initial: number) => {
  const [page, setPage] = useState(initial)
  const previous = usePrevious(page)

  const direction = (previous ?? initial) < page ? 1 : -1
  const paginate = (direction: number) => setPage((prev) => prev + direction)

  return [{ page, direction }, paginate] as const
}
