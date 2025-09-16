import { Separator, ValueStats } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useOmnipoolStablepoolAssets, useXYKPools } from "@/states/liquidity"

export const AllPools = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { data: omnipoolStablepoolAssets = [], isLoading } =
    useOmnipoolStablepoolAssets()
  const { data: xykPools = [], isLoading: isLoadingXYK } = useXYKPools()

  const xykTotals = xykPools.reduce(
    (acc, asset) => ({
      liquidity: acc.liquidity.plus(asset.tvlDisplay || "0"),
      volume: acc.volume.plus(asset.volumeDisplay || "0"),
    }),
    {
      liquidity: Big(0),
      volume: Big(0),
    },
  )

  const totals = omnipoolStablepoolAssets.reduce(
    (acc, asset) => ({
      liquidity: acc.liquidity.plus(asset.tvlDisplay || "0"),
      stablepool: asset.isStablePool
        ? acc.stablepool.plus(asset.tvlDisplay || "0")
        : acc.stablepool,
      volume: acc.volume.plus(asset.volumeDisplay || "0"),
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
          value: totals.liquidity
            .plus(xykTotals.liquidity)
            .plus(totals.stablepool),
        })}
        size="medium"
        isLoading={isLoading || isLoadingXYK}
        wrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency", {
          value: Big(totals.volume).plus(xykTotals.volume),
        })}
        isLoading={isLoading}
        size="medium"
        wrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInOmnipool")}
        value={t("common:currency", { value: totals.liquidity })}
        size="medium"
        isLoading={isLoading}
        wrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInStablepool")}
        value={t("common:currency", { value: totals.stablepool })}
        size="medium"
        isLoading={isLoading}
        wrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInIsolatedPools")}
        value={t("common:currency", {
          value: xykTotals.liquidity,
        })}
        size="medium"
        wrap
      />
    </>
  )
}
