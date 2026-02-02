import { DataTableRef, SectionHeader } from "@galacticcouncil/ui/components"
import { FC, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyAssetsActions } from "@/modules/wallet/assets/MyAssets/MyAssetsActions"
import { MyAssetsTable } from "@/modules/wallet/assets/MyAssets/MyAssetsTable"
import { useMyAssetsTableData } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.data"

type Props = {
  readonly searchPhrase: string
  readonly paginationProps: PaginationProps
  readonly sortingProps: SortingProps
}

export const MyAssets: FC<Props> = ({
  searchPhrase,
  paginationProps,
  sortingProps,
}) => {
  const { t } = useTranslation("wallet")
  const [showAllAssets, setShowAllAssets] = useState(false)

  const tableRef = useRef<DataTableRef>(null)

  const { data, isLoading } = useMyAssetsTableData(showAllAssets)

  return (
    <>
      <SectionHeader
        title={t("myAssets.header.title")}
        actions={
          <MyAssetsActions
            showAllAssets={showAllAssets}
            onToggleShowAllAssets={() => {
              setShowAllAssets((showAllAssets) => !showAllAssets)
              tableRef.current?.onPaginationReset()
            }}
          />
        }
      />
      <MyAssetsTable
        ref={tableRef}
        data={data}
        isLoading={isLoading}
        searchPhrase={searchPhrase}
        paginationProps={paginationProps}
        sortingProps={sortingProps}
      />
    </>
  )
}
