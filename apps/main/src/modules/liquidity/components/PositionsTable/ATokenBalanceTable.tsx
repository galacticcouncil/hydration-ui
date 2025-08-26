import { DataTable, Icon, Text } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { Circle } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { OmnipoolAssetTable } from "@/modules/liquidity/Liquidity.utils"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

import { useBalanceTableColumns } from "./PositionsTable.columns"
import { STableHeader } from "./PositionsTable.styled"
import { BalanceTableData } from "./StableswapBalanceTable"

export const ATokenBalanceTable = ({ pool }: { pool: OmnipoolAssetTable }) => {
  const { t } = useTranslation(["liquidity"])
  const balanceColumns = useBalanceTableColumns()
  const { aStableswapBalance, aStableswapAsset, isStablepoolInOmnipool } = pool
  const { price, isValid } = useAssetPrice(aStableswapAsset?.id)

  const tableData: BalanceTableData[] = useMemo(() => {
    if (!aStableswapBalance || !aStableswapAsset) return []

    const freeBalance = scaleHuman(
      aStableswapBalance,
      aStableswapAsset.decimals,
    )

    return [
      {
        label: t("liquidity:liquidity.stablepool.position.supplied"),
        poolId: aStableswapAsset.id,
        isStablepoolInOmnipool,
        value: freeBalance,
        valueDisplay: isValid
          ? Big(price).times(freeBalance).toString()
          : undefined,
      },
    ]
  }, [
    aStableswapBalance,
    aStableswapAsset,
    t,
    isStablepoolInOmnipool,
    isValid,
    price,
  ])

  if (!tableData.length) return null

  return (
    <>
      <STableHeader>
        <Icon component={Circle} size={12} />
        <Text fw={500} font="primary">
          {t("liquidity:liquidity.stablepool.position.supplied")}
        </Text>
      </STableHeader>
      <DataTable
        data={tableData}
        columns={balanceColumns}
        paginated
        pageSize={10}
        columnPinning={{
          left: ["position"],
        }}
      />
    </>
  )
}
