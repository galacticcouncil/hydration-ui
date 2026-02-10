import { FC } from "react"

import { Flex } from "@/components/Flex"

import { getPaginationRange } from "./Pagination.utils"
import { PaginationDots } from "./PaginationDots"
import { PaginationNavButton } from "./PaginationNavButton"
import { PaginationPageButton } from "./PaginationPageButton"

export type PaginationProps = {
  totalPages: number
  currentPage: number
  onPageChange?: (page: number) => void
  onPreviousPage?: () => void
  onNextPage?: () => void
  alwaysVisible?: boolean
}

export const Pagination: FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
  alwaysVisible = false,
}) => {
  const range = getPaginationRange(totalPages, currentPage)

  const handlePageClick = (pageNumber: number) => {
    onPageChange?.(pageNumber)
  }

  const handlePreviousClick = () => {
    if (currentPage > 1) {
      onPreviousPage?.()
      onPageChange?.(currentPage - 1)
    }
  }

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onNextPage?.()
      onPageChange?.(currentPage + 1)
    }
  }

  if (totalPages <= 1 && !alwaysVisible) {
    return null
  }

  return (
    <Flex p="base" gap="s" justify="center">
      <PaginationNavButton
        direction="prev"
        disabled={currentPage === 1}
        onClick={handlePreviousClick}
      >
        Prev
      </PaginationNavButton>
      {range.map((pageNumber) =>
        typeof pageNumber === "string" ? (
          <PaginationDots key={pageNumber} />
        ) : (
          <PaginationPageButton
            key={pageNumber}
            pageNumber={pageNumber}
            isActive={pageNumber === currentPage}
            onClick={() => handlePageClick(pageNumber)}
          />
        ),
      )}
      <PaginationNavButton
        direction="next"
        disabled={currentPage === totalPages}
        onClick={handleNextClick}
      >
        Next
      </PaginationNavButton>
    </Flex>
  )
}
