import { FormattedGhoReserveData } from "@aave/math-utils"
import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { Flex, Stack, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { CapProgressCircle } from "@/modules/borrow/reserve/components/CapProgressCircle"

type HollarBorrowInfoProps = {
  reserve: ComputedReserveData
  ghoReserveData: FormattedGhoReserveData
  totalBorrowed: string
  totalBorrowedUSD: string
  maxAvailableToBorrow: string
  maxAvailableToBorrowUSD: string
  borrowCapUsage: number
}

export const HollarBorrowInfo = ({
  reserve,
  ghoReserveData,
  totalBorrowed,
  totalBorrowedUSD,
  maxAvailableToBorrow,
  maxAvailableToBorrowUSD,
  borrowCapUsage,
}: HollarBorrowInfoProps) => {
  const { t } = useTranslation(["common", "borrow"])

  return (
    <Flex
      direction={["column", "row"]}
      gap={[20, 40]}
      align={["start", "center"]}
    >
      <CapProgressCircle
        radius={[16, 56]}
        thickness={3}
        labelPosition={["end", "center"]}
        percent={borrowCapUsage}
        tooltip={t("borrow:borrow.cap.tooltip", {
          value: maxAvailableToBorrow,
          tokenSymbol: reserve.symbol,
          usdValue: maxAvailableToBorrowUSD,
        })}
      />

      <Stack
        gap={[10, 40]}
        direction={["column", "row"]}
        justify="start"
        separated
        width="100%"
      >
        <ValueStats
          size="small"
          font="secondary"
          wrap
          label={t("borrow:market.table.totalBorrowed")}
          value={t("borrow:cap.range", {
            valueA: totalBorrowed,
            valueB: maxAvailableToBorrow,
          })}
          bottomLabel={t("borrow:cap.range.usd", {
            valueA: totalBorrowedUSD,
            valueB: maxAvailableToBorrowUSD,
          })}
        />

        <ValueStats
          size="small"
          font="secondary"
          wrap
          label={t("borrow:apy.variable")}
          value={t("percent", {
            value: Number(ghoReserveData.ghoVariableBorrowAPY) * 100,
          })}
        />
      </Stack>
    </Flex>
  )
}
