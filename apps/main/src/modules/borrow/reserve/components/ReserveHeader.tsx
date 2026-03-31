import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { Flex, ScrollArea, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export type ReserveHeaderProps = {
  reserve: ComputedReserveData
}

export const ReserveHeader: React.FC<ReserveHeaderProps> = ({ reserve }) => {
  const { t } = useTranslation(["common", "borrow"])

  const utilRate = Number(reserve.borrowUsageRatio ?? 0) * 100

  return (
    <ScrollArea
      orientation="horizontal"
      horizontalEdgeOffset="var(--layout-gutter)"
    >
      <Flex gap="xxl" justify="space-between">
        <ValueStats
          label={t("borrow:reserve.reserveSize")}
          value={t("currency.compact", {
            value: Math.max(Number(reserve.totalLiquidityUSD), 0),
          })}
          size="large"
          wrap
        />
        <ValueStats
          label={t("borrow:reserve.availableLiq")}
          value={t("currency.compact", {
            value: Math.max(Number(reserve.availableLiquidityUSD), 0),
          })}
          size="large"
          wrap
        />
        {utilRate > 0 && (
          <ValueStats
            label={t("borrow:reserve.utilRate")}
            value={t("percent", {
              value: utilRate,
            })}
            size="large"
            wrap
          />
        )}
        <ValueStats
          label={t("borrow:reserve.oraclePrice")}
          value={t("currency", {
            value: Number(reserve.priceInUSD ?? 0),
          })}
          size="large"
          wrap
        />
      </Flex>
    </ScrollArea>
  )
}
