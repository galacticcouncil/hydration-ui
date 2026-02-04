import { range } from "remeda"

const PAGINATION_DOTS = "..."

export function getPaginationRange(
  totalPages: number,
  currentPage: number,
): Array<number | string> {
  const maxLength = 5
  const pagination = []

  pagination.push(1)

  if (totalPages <= maxLength) {
    pagination.push(...range(2, totalPages + 1))

    return pagination
  }

  const innerMaxLength = maxLength - 2
  const sideLength = Math.floor((innerMaxLength - 1) / 2)

  let startPage = currentPage - sideLength
  let endPage = currentPage + sideLength

  if (startPage <= 1) {
    startPage = 2
    endPage = startPage + innerMaxLength - 1
  }
  if (endPage >= totalPages) {
    endPage = totalPages - 1
    startPage = endPage - innerMaxLength + 1
  }

  if (startPage > 2) {
    pagination.push(PAGINATION_DOTS)
  }

  pagination.push(...range(startPage, endPage + 1))

  if (endPage < totalPages - 1) {
    pagination.push(PAGINATION_DOTS)
  }

  pagination.push(totalPages)

  return pagination
}
