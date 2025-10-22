import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { bigMax } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

export type HollarReserveHeaderProps = {
  reserve: ComputedReserveData
}

export const HollarReserveHeader: React.FC<HollarReserveHeaderProps> = ({
  reserve,
}) => {
  const { t } = useTranslation(["common", "borrow"])

  return (
    <Stack direction={["column", "row"]} separated gap={[10, null, 40, 60]}>
      <ValueStats
        label={t("borrow:reserve.reserveSize")}
        value={t("currency.compact", {
          value: bigMax(reserve.totalLiquidityUSD, 0),
        })}
        size="large"
        wrap={[false, false, true]}
      />
      <ValueStats
        label={t("borrow:reserve.maxToBorrow")}
        value={t("currency.compact", {
          value: bigMax(reserve.borrowCap, 0),
        })}
        size="large"
        wrap={[false, false, true]}
      />
      <ValueStats
        label={t("price")}
        value={t("currency", {
          value: Number(reserve.priceInUSD ?? 0),
        })}
        size="large"
        wrap={[false, false, true]}
      />
    </Stack>
  )
}
