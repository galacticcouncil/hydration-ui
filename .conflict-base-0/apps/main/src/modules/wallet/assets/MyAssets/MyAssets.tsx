import {
  DataTableRef,
  Flex,
  SectionHeader,
} from "@galacticcouncil/ui/components"
import { FC, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { MyAssetsActions } from "@/modules/wallet/assets/MyAssets/MyAssetsActions"
import { MyAssetsTable } from "@/modules/wallet/assets/MyAssets/MyAssetsTable"

type Props = {
  readonly searchPhrase: string
}

export const MyAssets: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation("wallet")
  const [showAllAssets, setShowAllAssets] = useState(false)

  const tableRef = useRef<DataTableRef>(null)

  return (
    <div>
      <Flex justify="space-between" align="center">
        <SectionHeader>{t("myAssets.header.title")}</SectionHeader>
        <MyAssetsActions
          showAllAssets={showAllAssets}
          onToggleShowAllAssets={() => {
            setShowAllAssets((showAllAssets) => !showAllAssets)
            tableRef.current?.onPaginationReset()
          }}
        />
      </Flex>
      <MyAssetsTable
        ref={tableRef}
        searchPhrase={searchPhrase}
        showAllAssets={showAllAssets}
      />
    </div>
  )
}
