import { FC } from "react"

import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyAssetsEmptyState } from "@/modules/portfolio/overview/MyAssets/MyAssetsEmptyState"
import { MyAssetsTable } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable"
import { MyAsset } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly data: Array<MyAsset>
  readonly isEmpty: boolean
  readonly isLoading: boolean
  readonly searchPhrase: string
  readonly sortingProps: SortingProps
}

export const MyAssets: FC<Props> = ({
  data,
  isEmpty,
  isLoading,
  searchPhrase,
  sortingProps,
}) => {
  if (!isLoading && isEmpty) {
    return <MyAssetsEmptyState />
  }

  return (
    <MyAssetsTable
      data={data}
      isLoading={isLoading}
      searchPhrase={searchPhrase}
      sortingProps={sortingProps}
    />
  )
}
