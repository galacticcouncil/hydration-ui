import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { DataTableRef, SectionHeader } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyAssetsActions } from "@/modules/wallet/assets/MyAssets/MyAssetsActions"
import {
  MyAssetsMultichainTable,
  WalletPortfolioTab,
} from "@/modules/wallet/assets/MyAssets/MyAssetsMultichainTable"
import { MyAssetsTable } from "@/modules/wallet/assets/MyAssets/MyAssetsTable"
import { useMyAssetsTableData } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.data"
import { MyBonds } from "@/modules/wallet/assets/MyBonds/MyBonds"
import { MyLiquidity } from "@/modules/wallet/assets/MyLiquidity/MyLiquidity"

type Props = {
  readonly searchPhrase: string
  readonly onSearchPhraseChange: (searchPhrase: string) => void
  readonly paginationProps: PaginationProps
  readonly sortingProps: SortingProps
  readonly liquidityPaginationProps?: PaginationProps
  readonly liquiditySortingProps?: SortingProps
  readonly bondsPaginationProps?: PaginationProps
  readonly bondsSortingProps?: SortingProps
  readonly trackedOnly?: boolean
}

export const MyAssets: FC<Props> = ({
  searchPhrase,
  onSearchPhraseChange,
  paginationProps,
  sortingProps,
  liquidityPaginationProps = paginationProps,
  liquiditySortingProps = sortingProps,
  bondsPaginationProps = paginationProps,
  bondsSortingProps = sortingProps,
  trackedOnly = false,
}) => {
  const { t } = useTranslation("wallet")
  const { isMobile } = useBreakpoints()
  const [showAllAssets, setShowAllAssets] = useState(false)
  const [activeTab, setActiveTab] = useState<WalletPortfolioTab>("assets")

  const tableRef = useRef<DataTableRef>(null)

  const { data, isLoading } = useMyAssetsTableData(showAllAssets)

  const onToggleShowAllAssets = () => {
    setShowAllAssets((showAllAssets) => !showAllAssets)
    tableRef.current?.onPaginationReset()
  }

  if (!isMobile || trackedOnly) {
    return (
      <MyAssetsMultichainTable
        data={data}
        isLoading={isLoading}
        searchPhrase={searchPhrase}
        onSearchPhraseChange={onSearchPhraseChange}
        showAllAssets={showAllAssets}
        onToggleShowAllAssets={onToggleShowAllAssets}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        liquidityContent={
          <MyLiquidity
            embedded
            searchPhrase={searchPhrase}
            paginationProps={liquidityPaginationProps}
            sortingProps={liquiditySortingProps}
            showAllAssets={showAllAssets}
          />
        }
        strategyContent={<StrategiesPlaceholder />}
        trackedOnly={trackedOnly}
        bondsContent={
          <MyBonds
            embedded
            searchPhrase={searchPhrase}
            paginationProps={bondsPaginationProps}
            sortingProps={bondsSortingProps}
            showAllAssets={showAllAssets}
          />
        }
      />
    )
  }

  return (
    <>
      <SectionHeader
        title={t("myAssets.header.title")}
        actions={
          <MyAssetsActions
            showAllAssets={showAllAssets}
            onToggleShowAllAssets={onToggleShowAllAssets}
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

const StrategiesPlaceholder = () => {
  const { t } = useTranslation("wallet")

  return (
    <EmptyState
      sx={{ py: "xxxl" }}
      image={NoFunds}
      header={t("myAssets.redesign.strategies.empty")}
      description={t("myAssets.redesign.strategies.empty.description")}
    />
  )
}
