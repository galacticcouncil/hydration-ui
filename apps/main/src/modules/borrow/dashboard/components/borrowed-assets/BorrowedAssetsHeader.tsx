import { useUserData } from "@galacticcouncil/money-market/hooks"
import {
  Flex,
  Skeleton,
  SValueStatsValue,
  ValueStats,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

export const BorrowedAssetsHeader = () => {
  const { t } = useTranslation(["common", "borrow"])

  const { loading, ...user } = useUserData()

  const maxBorrowAmount = Big(
    user?.totalBorrowsMarketReferenceCurrency || "0",
  ).plus(user?.availableBorrowsMarketReferenceCurrency || "0")

  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? Big(0)
    : Big(user?.totalBorrowsMarketReferenceCurrency || "0").div(maxBorrowAmount)

  return (
    <Flex gap={40} p={20}>
      <ValueStats
        wrap
        size="small"
        label={t("balance")}
        customValue={
          <SValueStatsValue size="small">
            {loading ? (
              <Skeleton width={50} />
            ) : (
              t("currency", {
                value: user.totalBorrowsUSD,
                maximumFractionDigits: 2,
              })
            )}
          </SValueStatsValue>
        }
      />
      <ValueStats
        wrap
        size="small"
        label={t("apy")}
        customValue={
          <SValueStatsValue size="small">
            {loading ? (
              <Skeleton width={50} />
            ) : (
              t("percent", {
                value: Number.isFinite(user.debtAPY) ? user.debtAPY * 100 : 0,
              })
            )}
          </SValueStatsValue>
        }
      />
      <ValueStats
        wrap
        size="small"
        label={t("borrow:borrowPower")}
        value={t("currency", { value: 12245 })}
        customValue={
          <SValueStatsValue size="small">
            {loading ? (
              <Skeleton width={50} />
            ) : (
              t("percent", {
                value: collateralUsagePercent.toNumber() * 100,
              })
            )}
          </SValueStatsValue>
        }
      />
    </Flex>
  )
}
