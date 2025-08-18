import { Separator, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useMyLiquidityAmount } from "@/modules/liquidity/components/PoolsHeader/MyLiquidity.data"

import { ClaimRewardsButton } from "./ClaimRewardsButton"

export const MyLiquidity = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    totalAmount,
    omnipool,
    stablepoolTotal,
    isLoading,
    isLoadingPositions,
  } = useMyLiquidityAmount()

  return (
    <>
      <ValueStats
        label={t("liquidity:header.myLiquidity")}
        value={t("common:currency", {
          value: totalAmount,
        })}
        bottomLabel={t("header.myLiquidity.value", {
          value: omnipool?.farming ?? "0",
        })}
        size="medium"
        isLoading={isLoading || isLoadingPositions}
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInOmnipool")}
        value={t("common:currency", {
          value: omnipool?.liquidity.toString() ?? "0",
        })}
        size="medium"
        isLoading={isLoadingPositions}
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInStablepool")}
        value={t("common:currency", { value: stablepoolTotal })}
        size="medium"
        isLoading={isLoading}
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInIsolatedPools")}
        value={t("common:currency", { value: "0" })}
        size="medium"
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ClaimRewardsButton />
    </>
  )
}
