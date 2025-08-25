import { Circle } from "@galacticcouncil/ui/assets/icons"
import { DataTable, Icon, Text } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { OmnipoolAssetTable } from "@/modules/liquidity/Liquidity.utils"
import { scaleHuman } from "@/utils/formatting"

import { useBalanceTableColumns } from "./PositionsTable.columns"
import { STableHeader } from "./PositionsTable.styled"

export type BalanceTableData = {
  label: string
  poolId: string
  isStablepoolInOmnipool: boolean
  value: string
  valueDisplay: string | undefined
}

export const BalanceTable = ({ pool }: { pool: OmnipoolAssetTable }) => {
  const { t } = useTranslation(["liquidity"])
  const balanceColumns = useBalanceTableColumns()

  const { stableswapBalance, price, id, meta, isStablepoolInOmnipool } = pool

  const freeBalance = stableswapBalance
    ? scaleHuman(stableswapBalance, meta.decimals)
    : undefined

  if (!freeBalance) return null

  const tableData: BalanceTableData[] = [
    {
      label: t("liquidity:liquidity.stablepool.position.shares"),
      poolId: id,
      isStablepoolInOmnipool,
      value: freeBalance,
      valueDisplay: price
        ? Big(price).times(freeBalance).toString()
        : undefined,
    },
  ]

  return (
    <>
      <STableHeader>
        <Icon component={Circle} size={12} />
        <Text fw={500} font="primary">
          {t("liquidity.stablepool.position.label")}
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
