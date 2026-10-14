import { HOLLAR_BOND_24_11_26_ID } from "@galacticcouncil/utils"
import { FC } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyBondsEmptyState } from "@/modules/portfolio/overview/MyBonds/MyBondsEmptyState"
import { MyBondsTable } from "@/modules/portfolio/overview/MyBonds/MyBondsTable"
import { useMyBondsTableData } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.data"
import { createStrategyPreviewBond } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.preview"
import { usePortfolioPreview } from "@/modules/portfolio/overview/usePortfolioPreview"
import { useAssets } from "@/providers/assetsProvider"

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
  const live = useMyBondsTableData()
  const { isPreview } = usePortfolioPreview()
  const { getBond, getAssetWithFallback } = useAssets()
  const data = isPreview
    ? [
        createStrategyPreviewBond(
          getBond(HOLLAR_BOND_24_11_26_ID),
          getAssetWithFallback("222").iconSrc,
        ),
      ]
    : live.data
  const isLoading = !isPreview && live.isLoading

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
