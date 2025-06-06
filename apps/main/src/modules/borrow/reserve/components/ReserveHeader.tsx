import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export type ReserveHeaderProps = {
  reserve: ComputedReserveData
}

export const ReserveHeader: React.FC<ReserveHeaderProps> = ({ reserve }) => {
  const { t } = useTranslation(["common", "borrow"])

  return (
    <Stack direction={["column", "row"]} separated gap={[10, null, 40, 60]}>
      <ValueStats
        label={t("borrow:reserve.reserveSize")}
        value={t("currency.compact", {
          value: Math.max(Number(reserve.totalLiquidityUSD), 0),
        })}
        size="large"
      />
      <ValueStats
        label={t("borrow:reserve.availableLiq")}
        value={t("currency.compact", {
          value: Math.max(Number(reserve.availableLiquidityUSD), 0),
        })}
        size="large"
      />
      <ValueStats
        label={t("borrow:reserve.utilRate")}
        value={t("percent", {
          value: Number(reserve.borrowUsageRatio ?? 0) * 100,
        })}
        size="large"
      />
      <ValueStats
        label={t("borrow:reserve.oraclePrice")}
        value={t("currency", {
          value: Number(reserve.priceInUSD ?? 0),
        })}
        size="large"
      />
    </Stack>
  )
}
