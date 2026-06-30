import { useUserData } from "@galacticcouncil/money-market/hooks"
import {
  Flex,
  SValueStatsValue,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { UnavailableApy } from "@/components/DetailedApy/UnavailableApy"
import { useApyContext } from "@/modules/borrow/context/ApyContext"

export const SuppliedAssetsHeader = () => {
  const { t } = useTranslation(["common", "borrow"])

  const { loading, ...user } = useUserData()
  const { isLoading: isApyLoading } = useApyContext()

  return (
    <Flex gap="xxxl" p="xl">
      <ValueStats
        wrap
        size="small"
        label={t("balance")}
        isLoading={loading}
        value={t("currency", {
          value: user.totalLiquidityUSD,
          maximumFractionDigits: 2,
        })}
      />
      <ValueStats
        wrap
        size="small"
        label={t("apy")}
        isLoading={loading || isApyLoading}
        customValue={
          user.earnedAPY !== null ? (
            <SValueStatsValue size="small">
              {t("percent", {
                value: Number.isFinite(user.earnedAPY)
                  ? user.earnedAPY * 100
                  : 0,
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
        label={t("borrow:collateral")}
        isLoading={loading}
        value={t("currency", {
          value: user.totalCollateralUSD,
          maximumFractionDigits: 2,
        })}
      />
    </Flex>
  )
}
