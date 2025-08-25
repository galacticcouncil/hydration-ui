import { Separator, ValueStats } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import {
  isOmnipoolDepositPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { useOmnipoolStablepoolAssets } from "@/states/liquidity"

import { ClaimRewardsButton } from "./ClaimRewardsButton"

export const MyLiquidity = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { data = [], isLoading } = useOmnipoolStablepoolAssets()
  const { data: positions, isLoading: isLoadingPositions } =
    useAccountOmnipoolPositionsData()

  const stablepoolTotal = data
    .reduce(
      (acc, asset) =>
        asset.isStablePool
          ? acc.plus(asset.stableswapBalanceDisplay ?? 0)
          : acc,
      Big(0),
    )
    .toString()

  const omnipool = positions?.all.reduce(
    (acc, position) => {
      acc.liquidity = acc.liquidity.plus(
        position.data?.currentTotalDisplay ?? 0,
      )

      if (isOmnipoolDepositPosition(position)) {
        acc.farming = acc.farming.plus(position.data?.currentTotalDisplay ?? 0)
      }

      return acc
    },
    {
      liquidity: Big(0),
      farming: Big(0),
    },
  )

  return (
    <>
      <ValueStats
        label={t("liquidity:header.myLiquidity")}
        value={t("common:currency", {
          value: Big(stablepoolTotal)
            .plus(omnipool?.liquidity ?? 0)
            .toString(),
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
