import BN from "bignumber.js"
import { useStableswapPool } from "api/stableswap"
import { useTranslation } from "react-i18next"
import { SummaryRow } from "components/Summary/SummaryRow"
import { BN_MILL } from "utils/constants"

export const StablepoolFeeSummaryRow = ({ poolId }: { poolId: string }) => {
  const { t } = useTranslation()
  const { data } = useStableswapPool(poolId)

  return (
    <SummaryRow
      label={t("liquidity.add.modal.tradeFee")}
      withSeparator
      content={t("value.percentage", {
        value: BN(data?.fee.toString() ?? 0)
          .div(BN_MILL)
          .multipliedBy(100),
      })}
      description={t("liquidity.add.modal.tradeFee.description")}
    />
  )
}
