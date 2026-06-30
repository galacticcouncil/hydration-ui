import { useUserData } from "@galacticcouncil/money-market/hooks"
import {
  Flex,
  SValueStatsValue,
  ValueStats,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { UnavailableApy } from "@/components/DetailedApy/UnavailableApy"
import { useApyContext } from "@/modules/borrow/context/ApyContext"

export const BorrowedAssetsHeader = () => {
  const { t } = useTranslation(["common", "borrow"])

  const { loading, ...user } = useUserData()
  const { isLoading: isApyLoading } = useApyContext()

  const maxBorrowAmount = Big(
    user?.totalBorrowsMarketReferenceCurrency || "0",
  ).plus(user?.availableBorrowsMarketReferenceCurrency || "0")

  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? Big(0)
    : Big(user?.totalBorrowsMarketReferenceCurrency || "0").div(maxBorrowAmount)

  return (
    <Flex gap="xxxl" p="xl">
      <ValueStats
        wrap
        size="small"
        label={t("balance")}
        isLoading={loading}
        value={t("currency", {
          value: user.totalBorrowsUSD,
          maximumFractionDigits: 2,
        })}
      />
      <ValueStats
        wrap
        size="small"
        label={t("apy")}
        isLoading={loading || isApyLoading}
        customValue={
          user.debtAPY !== null ? (
            <SValueStatsValue size="small">
              {t("percent", {
                value: Number.isFinite(user.debtAPY) ? user.debtAPY * 100 : 0,
              })}
            </SValueStatsValue>
          ) : (
            <SValueStatsValue size="small">
              <UnavailableApy />
            </SValueStatsValue>
          )
        }
      />
      <ValueStats
        wrap
        size="small"
        label={t("borrow:borrowPower")}
        isLoading={loading}
        value={t("percent", {
          value: collateralUsagePercent.toNumber() * 100,
        })}
      />
    </Flex>
  )
}
