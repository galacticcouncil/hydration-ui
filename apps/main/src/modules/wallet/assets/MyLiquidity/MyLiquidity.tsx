import { FC } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyLiquidityEmptyState } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityEmptyState"
import { MyLiquidityTable } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable"
import { useMyLiquidityTableData } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"

import { useMyIsolatedPoolsLiquidity } from "./MyIsolatedPoolsLiquidity.data"

type Props = {
  readonly searchPhrase: string
  readonly paginationProps: PaginationProps
  readonly sortingProps: SortingProps
}

export const MyLiquidity: FC<Props> = ({
  searchPhrase,
  paginationProps,
  sortingProps,
}) => {
  const { data: liquidityData, isLoading: liquidityLoading } =
    useMyLiquidityTableData()

  const {
    data: isolatedPoolsLiquidity,
    isLoading: isLoadingIsolatedPoolsLiquidity,
  } = useMyIsolatedPoolsLiquidity()

  const data = [...liquidityData, ...isolatedPoolsLiquidity]
  const isLoading = liquidityLoading || isLoadingIsolatedPoolsLiquidity

  if (!isLoading && data.length === 0) {
    return <MyLiquidityEmptyState />
  }

  return (
    <MyLiquidityTable
      data={data}
      isLoading={isLoading}
      searchPhrase={searchPhrase}
      paginationProps={paginationProps}
      sortingProps={sortingProps}
    />
  )
}
