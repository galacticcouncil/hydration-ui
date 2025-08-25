import { useUserData } from "@galacticcouncil/money-market/hooks"
import {
  Flex,
  Skeleton,
  SValueStatsValue,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const SuppliedAssetsHeader = () => {
  const { t } = useTranslation(["common", "borrow"])

  const { loading, ...user } = useUserData()

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
                value: user.totalLiquidityUSD,
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
                value: Number.isFinite(user.earnedAPY)
                  ? user.earnedAPY * 100
                  : 0,
              })
            )}
          </SValueStatsValue>
        }
      />
      <ValueStats
        wrap
        size="small"
        label={t("borrow:collateral")}
        customValue={
          <SValueStatsValue size="small">
            {loading ? (
              <Skeleton width={50} />
            ) : (
              t("currency", {
                value: user.totalCollateralUSD,
                maximumFractionDigits: 2,
              })
            )}
          </SValueStatsValue>
        }
      />
    </Flex>
  )
}
