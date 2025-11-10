import { SuppliedLiquidityIcon } from "@galacticcouncil/ui/assets/icons"
import { DataTable, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { OmnipoolAssetTable } from "@/modules/liquidity/Liquidity.utils"
import { scaleHuman } from "@/utils/formatting"

import { useBalanceTableColumns } from "./PositionsTable.columns"
import { STableHeader } from "./PositionsTable.styled"
import { BalanceTableData } from "./PositionsTable.utils"

export const ATokenBalanceTable = ({
  pool,
  aStableswapDisplayBalance,
}: {
  pool: OmnipoolAssetTable
  aStableswapDisplayBalance?: string
}) => {
  const { t } = useTranslation(["liquidity"])
  const balanceColumns = useBalanceTableColumns()
  const {
    aStableswapBalance,
    aStableswapAsset,
    isStablepoolInOmnipool,
    stablepoolData,
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

    return [
      {
        meta: aStableswapAsset,
        label: t("liquidity:liquidity.stablepool.position.supplied"),
        poolId: aStableswapAsset.id,
        isStablepoolInOmnipool,
        value: freeBalance,
        valueDisplay: aStableswapDisplayBalance,
        stableswapId,
      },
    ]
  }, [
    aStableswapBalance,
    aStableswapAsset,
    t,
    isStablepoolInOmnipool,
    aStableswapDisplayBalance,
    stableswapId,
  ])

  if (!tableData.length) return null

  return (
    <>
      <STableHeader>
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
        paginated
        pageSize={10}
        columnPinning={{
          left: ["meta_name"],
        }}
        sx={{ minWidth: 900 }}
      />
    </>
  )
}
