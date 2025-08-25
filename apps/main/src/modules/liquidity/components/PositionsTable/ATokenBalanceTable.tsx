import { DataTable, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Circle } from "lucide-react"
import { useTranslation } from "react-i18next"

import { OmnipoolAssetTable } from "@/modules/liquidity/Liquidity.utils"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

import { useBalanceTableColumns } from "./PositionsTable.columns"
import { BalanceTableData } from "./StableswapBalanceTable"

export const ATokenBalanceTable = ({ pool }: { pool: OmnipoolAssetTable }) => {
  const { t } = useTranslation(["liquidity"])
  const balanceColumns = useBalanceTableColumns()
  const { aStableswapBalance, aStableswapAsset, isStablepoolInOmnipool } = pool
  const { price } = useAssetPrice(aStableswapAsset?.id)

  if (!aStableswapBalance || !aStableswapAsset) return null

  const freeBalance = scaleHuman(aStableswapBalance, aStableswapAsset.decimals)

  const tableData: BalanceTableData[] = [
    {
      label: t("liquidity:liquidity.stablepool.position.supplied"),
      poolId: aStableswapAsset.id,
      isStablepoolInOmnipool,
      value: freeBalance,
      valueDisplay: price
        ? Big(price).times(freeBalance).toString()
        : undefined,
    },
  ]

  return (
    <>
      <Flex
        align="center"
        gap={getTokenPx("scales.paddings.s")}
        sx={{
          px: getTokenPx("containers.paddings.primary"),
          pt: getTokenPx("containers.paddings.tertiary"),
          color: getToken("text.tint.secondary"),
        }}
      >
        <Icon component={Circle} size={12} />
        <Text fw={500} font="primary">
          {t("liquidity:liquidity.stablepool.position.supplied")}
        </Text>
      </Flex>
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
