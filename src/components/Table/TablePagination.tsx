import { PaginationState, Table } from "@tanstack/react-table"
import { ButtonPagination, TableFooter } from "./Table.styled"
import { ReactElement, useCallback, useMemo, useState } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

type PaginationProps<T> = {
  table: Table<T>
}

const MAX_VISIBLE_BUTTONS = 3

const getButtons = (
  totalPages: number,
  currentPage: number,
  onClick: (index: number) => void,
) => {
  const middle = Math.floor(MAX_VISIBLE_BUTTONS / 2)

  let startPage = Math.max(2, currentPage - middle)
  let endPage = Math.min(totalPages - 1, currentPage + middle)

  // Adjust the range if near the start or end
  if (currentPage <= middle) {
    startPage = 2
    endPage = Math.min(MAX_VISIBLE_BUTTONS + 1, totalPages - 1)
  } else if (currentPage + middle >= totalPages) {
    startPage = Math.max(2, totalPages - MAX_VISIBLE_BUTTONS)
    endPage = totalPages - 1
  }

  const pages = Array.from({ length: totalPages }).reduce<ReactElement[]>(
    (acc, _, i) => {
      const page = i + 1
      const comp = (
        <ButtonPagination
          key={i}
          active={page === currentPage}
          onClick={() => onClick(i)}
        >
          {page}
        </ButtonPagination>
      )

      const gap = <Text color="white">...</Text>

      if (page === 1) {
        acc.push(comp)
      }

      if (page === 2 && startPage > 2) {
        acc.push(gap)
      }

      if (page >= startPage && page <= endPage) {
        acc.push(comp)
      }

      if (page === totalPages - 1 && endPage < totalPages - 1) {
        acc.push(gap)
      }

      if (page === totalPages) {
        acc.push(comp)
      }

      return acc
    },
    [],
  )

  return pages
}

export const TablePagination = <T,>({ table }: PaginationProps<T>) => {
  const { t } = useTranslation()
  const totalPages = Number(table.getPageCount().toLocaleString())
  const currentPage = table.getState().pagination.pageIndex + 1

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onPageIndexClick = useCallback((i: number) => table.setPageIndex(i), [])

  const buttons = useMemo(() => {
    return getButtons(totalPages, currentPage, onPageIndexClick)
  }, [totalPages, currentPage, onPageIndexClick])

  if (totalPages === 1) return null

  return (
    <TableFooter>
      <ButtonPagination
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      >
        {t("prev")}
      </ButtonPagination>
      {buttons}
      <ButtonPagination
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      >
        {t("next")}
      </ButtonPagination>
    </TableFooter>
  )
}

export const useTablePagination = () => {
  return useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
}
