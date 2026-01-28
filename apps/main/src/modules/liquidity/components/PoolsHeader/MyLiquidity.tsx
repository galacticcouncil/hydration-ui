import { ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useMyLiquidityTotals } from "@/modules/liquidity/components/PoolsHeader/MyLiquidity.data"

import { ClaimRewardsButton } from "./ClaimRewardsButton"
import { PoolsHeaderSeparator } from "./PoolsHeaderSeparator"

export const MyLiquidity = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    liquidityTotal,
    farmingTotal,
    omnipoolLiquidityTotal,
    stablepoolTotal,
    isolatedPoolsTotal,
    isBalanceLoading,
    isLiquidityLoading,
  } = useMyLiquidityTotals()

  return (
    <>
      <ValueStats
        label={t("liquidity:header.myLiquidity")}
        value={t("common:currency", {
          value: liquidityTotal,
        })}
        bottomLabel={t("header.myLiquidity.value", {
          value: farmingTotal,
        })}
        floatingBottomLabel
        size="medium"
        isLoading={isLiquidityLoading}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.valueInOmnipool")}
        value={t("common:currency", {
          value: omnipoolLiquidityTotal,
        })}
        size="medium"
        isLoading={isLiquidityLoading}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.valueInStablepool")}
        value={t("common:currency", { value: stablepoolTotal })}
        size="medium"
        isLoading={isBalanceLoading}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.valueInIsolatedPools")}
        value={t("common:currency", { value: isolatedPoolsTotal })}
        isLoading={isLiquidityLoading}
        size="medium"
        wrap
      />
      <PoolsHeaderSeparator />
      <ClaimRewardsButton />
    </>
  )
}
