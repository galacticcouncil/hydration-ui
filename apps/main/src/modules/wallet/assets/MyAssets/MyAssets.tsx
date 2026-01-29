import { DataTableRef, SectionHeader } from "@galacticcouncil/ui/components"
import { FC, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { MyAssetsActions } from "@/modules/wallet/assets/MyAssets/MyAssetsActions"
import { MyAssetsTable } from "@/modules/wallet/assets/MyAssets/MyAssetsTable"
import { useMyAssetsTableData } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.data"

type Props = {
  readonly searchPhrase: string
}

export const MyAssets: FC<Props> = ({ searchPhrase }) => {
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
      />
    </>
  )
}
