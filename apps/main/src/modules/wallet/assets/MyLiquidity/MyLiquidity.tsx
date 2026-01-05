import { Box, SectionHeader } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { MyLiquidityActions } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityActions"
import { MyLiquidityTable } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable"
import { useMyLiquidityTableData } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"

import { useMyIsolatedPoolsLiquidity } from "./MyIsolatedPoolsLiquidity.data"

type Props = {
  readonly searchPhrase: string
}

export const MyLiquidity: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation("wallet")
  const { isMobile } = useBreakpoints()

  const { data: liquidityData, isLoading: liquidityLoading } =
    useMyLiquidityTableData()

  const {
    data: isolatedPoolsLiquidity,
    isLoading: isLoadingIsolatedPoolsLiquidity,
  } = useMyIsolatedPoolsLiquidity()

  return (
    <Box>
      <SectionHeader
        title={t("myLiquidity.header.title")}
        actions={!isMobile && <MyLiquidityActions />}
      />
      <MyLiquidityTable
        data={[...liquidityData, ...isolatedPoolsLiquidity]}
        isLoading={liquidityLoading || isLoadingIsolatedPoolsLiquidity}
        searchPhrase={searchPhrase}
      />
    </Box>
  )
}
