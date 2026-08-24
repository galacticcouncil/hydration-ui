import { FC } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyBondsEmptyState } from "@/modules/portfolio/overview/MyBonds/MyBondsEmptyState"
import { MyBondsTable } from "@/modules/portfolio/overview/MyBonds/MyBondsTable"
import { useMyBondsTableData } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.data"

type Props = {
  readonly searchPhrase: string
  readonly paginationProps: PaginationProps
  readonly sortingProps: SortingProps
}

export const MyBonds: FC<Props> = ({
  searchPhrase,
  paginationProps,
  sortingProps,
}) => {
  const { data, isLoading } = useMyBondsTableData()

  if (!isLoading && data.length === 0) {
    return <MyBondsEmptyState />
  }

  return (
    <MyBondsTable
      data={data}
      isLoading={isLoading}
      searchPhrase={searchPhrase}
      paginationProps={paginationProps}
      sortingProps={sortingProps}
    />
  )
}
