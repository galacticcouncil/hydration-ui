import { Separator, ValueStats } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useOmnipoolStablepoolAssets } from "@/states/liquidity"

export const Omnipool = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { data: omnipoolStablepoolAssets = [], isLoading } =
    useOmnipoolStablepoolAssets()

  const totals = omnipoolStablepoolAssets.reduce(
    (acc, asset) => ({
      liquidity: acc.liquidity.plus(asset.tvlDisplay ?? 0),
      stablepool: asset.isStablePool
        ? acc.stablepool.plus(asset.tvlDisplay ?? 0)
        : acc.stablepool,
      volume: acc.volume.plus(asset.volumeDisplay ?? 0),
    }),
    {
      liquidity: Big(0),
      stablepool: Big(0),
      volume: Big(0),
    },
  )

  return (
    <>
      <ValueStats
        label={t("liquidity:header.totalLiquidity")}
        value={t("common:currency", {
          value: Big(totals.liquidity).plus(totals.stablepool).toString(),
        })}
        size="medium"
        isLoading={isLoading}
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency", { value: totals.volume })}
        isLoading={isLoading}
        size="medium"
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInOmnipool")}
        value={t("common:currency", { value: totals.liquidity })}
        size="medium"
        isLoading={isLoading}
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInStablepool")}
        value={t("common:currency", { value: totals.stablepool })}
        size="medium"
        isLoading={isLoading}
        alwaysWrap
      />
    </>
  )
}
