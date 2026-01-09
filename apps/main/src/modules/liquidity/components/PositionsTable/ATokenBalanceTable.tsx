import { SuppliedLiquidityIcon } from "@galacticcouncil/ui/assets/icons"
import { DataTable, Icon, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { OmnipoolAssetTable } from "@/modules/liquidity/Liquidity.utils"
import { scaleHuman } from "@/utils/formatting"

import {
  getBalanceTableColumns,
  useBalanceTableColumns,
} from "./PositionsTable.columns"
import { STableHeader } from "./PositionsTable.styled"
import { BalanceTableData } from "./PositionsTable.utils"

const bg = getToken("surfaces.containers.high.accent")

export const ATokenBalanceTable = ({
  pool,
  aStableswapDisplayBalance,
}: {
  pool: OmnipoolAssetTable
  aStableswapDisplayBalance?: string
}) => {
  const { t } = useTranslation(["liquidity"])
  const { isMobile } = useBreakpoints()
  const balanceColumns = useBalanceTableColumns()
  const {
    aStableswapBalance,
    aStableswapAsset,
    isStablepoolInOmnipool,
    stablepoolData,
    borrowApyData,
    lpFeeStablepool,
  } = pool

  const stableswapId = stablepoolData?.id.toString()

  const tableData: BalanceTableData[] = useMemo(() => {
    if (
      !aStableswapBalance ||
      !aStableswapAsset ||
      !aStableswapDisplayBalance ||
      !stableswapId
    )
      return []

    const freeBalance = scaleHuman(
      aStableswapBalance,
      aStableswapAsset.decimals,
    )

    const apr = {
      borrowApyData,
      lpFeeStablepool,
    }

    const totalApr = (borrowApyData?.totalSupplyApy ?? 0).toString()

    return [
      {
        meta: aStableswapAsset,
        label: t("liquidity:liquidity.stablepool.position.supplied"),
        poolId: aStableswapAsset.id,
        isStablepoolInOmnipool,
        value: freeBalance,
        valueDisplay: aStableswapDisplayBalance,
        stableswapId,
        canAddLiquidity: true,
        canRemoveLiquidity: true,
        apr,
        totalApr,
      },
    ]
  }, [
    aStableswapBalance,
    aStableswapAsset,
    t,
    isStablepoolInOmnipool,
    aStableswapDisplayBalance,
    stableswapId,
    borrowApyData,
    lpFeeStablepool,
  ])

  if (!tableData.length) return null

  return (
    <>
      <STableHeader sx={{ bg }}>
        <Icon
          component={SuppliedLiquidityIcon}
          size={12}
          color={getToken("text.tint.secondary")}
        />
        <Text fw={500} font="primary" color={getToken("text.tint.secondary")}>
          {t("liquidity:liquidity.stablepool.position.supplied")}
        </Text>
      </STableHeader>
      <DataTable
        data={tableData}
        columns={balanceColumns}
        columnPinning={{
          left: ["meta_name"],
        }}
        columnVisibility={getBalanceTableColumns(isMobile)}
        sx={{
          minWidth: [undefined, 900],
          tr: {
            bg,
          },
        }}
      />
    </>
  )
}
