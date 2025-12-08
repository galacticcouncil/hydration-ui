import { platformTotalQuery } from "@galacticcouncil/indexer/squid"
import { Separator, ValueStats } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"
import { useOmnipoolStablepoolAssets, useXYKPools } from "@/states/liquidity"

export const AllPools = () => {
  const { t } = useTranslation(["liquidity", "common"])

  const {
    data: platformTotal,
    isLoading: isLoadingPlatformTotal,
    isSuccess,
  } = useQuery(platformTotalQuery(useSquidClient()))
  const { data: xykPools = [], isLoading: isLoadingXYK } = useXYKPools()
  const { data: omnipoolStablepoolAssets = [] } = useOmnipoolStablepoolAssets()

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

  const totals_ = omnipoolStablepoolAssets.reduce(
    (acc, asset) => ({
      liquidity: acc.liquidity.plus(
        !asset.isStablepoolOnly ? asset.tvlDisplay || "0" : 0,
      ),
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
  console.log({
    omnipool: totals_.liquidity.toString(),
    stablepool: totals_.stablepool.toString(),
    volume: totals_.volume.toString(),
  })
  const totals = isSuccess
    ? {
        liquidity: Big(platformTotal?.omnipoolTvlNorm ?? "0"),
        stablepool: Big(platformTotal?.stablepoolsTvlNorm ?? "0"),
        volume: Big(platformTotal?.omnipoolVolNorm ?? "0")
          .plus(platformTotal?.stableswapVolNorm ?? "0")
          .plus(xykTotals.volume),
        totalLiquidity: Big(platformTotal?.omnipoolTvlNorm ?? "0")
          .plus(platformTotal?.stablepoolsTvlNorm ?? "0")
          .plus(xykTotals.liquidity),
      }
    : {
        liquidity: NaN,
        stablepool: NaN,
        volume: NaN,
        totalLiquidity: NaN,
      }

  return (
    <>
      <ValueStats
        label={t("liquidity:header.totalLiquidity")}
        value={t("common:currency", {
          value: totals.totalLiquidity,
        })}
        size="medium"
        isLoading={isLoadingPlatformTotal || isLoadingXYK}
        wrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency", {
          value: totals.volume,
        })}
        isLoading={isLoadingPlatformTotal || isLoadingXYK}
        size="medium"
        wrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInOmnipool")}
        value={t("common:currency", { value: totals.liquidity })}
        size="medium"
        isLoading={isLoadingPlatformTotal}
        wrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInStablepool")}
        value={t("common:currency", { value: totals.stablepool })}
        size="medium"
        isLoading={isLoadingPlatformTotal}
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
