import { Box, SectionHeader } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyLiquidityActions } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityActions"
import { MyLiquidityTable } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable"
import { useMyLiquidityTableData } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { hasVisibleDisplayValue } from "@/modules/wallet/assets/WalletAssets.utils"

import { useMyIsolatedPoolsLiquidity } from "./MyIsolatedPoolsLiquidity.data"

type Props = {
  readonly searchPhrase: string
  readonly paginationProps: PaginationProps
  readonly sortingProps: SortingProps
  readonly embedded?: boolean
  readonly showAllAssets?: boolean
}

export const MyLiquidity: FC<Props> = ({
  searchPhrase,
  paginationProps,
  sortingProps,
  embedded = false,
  showAllAssets = false,
}) => {
  const { t } = useTranslation("wallet")
  const { isMobile } = useBreakpoints()

  const { data: liquidityData, isLoading: liquidityLoading } =
    useMyLiquidityTableData(showAllAssets)

  const {
    data: isolatedPoolsLiquidity,
    isLoading: isLoadingIsolatedPoolsLiquidity,
  } = useMyIsolatedPoolsLiquidity()

  const data = useMemo(() => {
    const positions = [...liquidityData, ...isolatedPoolsLiquidity]

    return showAllAssets
      ? positions
      : positions.filter((position) =>
          hasVisibleDisplayValue(position.currentTotalDisplay),
        )
  }, [isolatedPoolsLiquidity, liquidityData, showAllAssets])

  return (
    <Box>
      {!embedded && (
        <SectionHeader
          title={t("myLiquidity.header.title")}
          actions={!isMobile && <MyLiquidityActions />}
        />
      )}
      <MyLiquidityTable
        data={data}
        isLoading={liquidityLoading || isLoadingIsolatedPoolsLiquidity}
        searchPhrase={searchPhrase}
        paginationProps={paginationProps}
        sortingProps={sortingProps}
        embedded={embedded}
      />
    </Box>
  )
}
