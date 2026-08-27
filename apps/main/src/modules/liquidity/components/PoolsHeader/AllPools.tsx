import { platformStatsQuery } from "@galacticcouncil/indexer/neckwork"
import { platformTotalQuery } from "@galacticcouncil/indexer/squid"
import { ValueStats } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { neckworkClient, useSquidClient } from "@/api/provider"
import { PoolsHeaderSeparator } from "@/modules/liquidity/components/PoolsHeader/PoolsHeaderSeparator"
import { useXYKPools } from "@/states/liquidity"
import { useNeckworkEnabled } from "@/states/neckwork"

const NO_TOTALS = {
  liquidity: NaN,
  stablepool: NaN,
  isolated: NaN,
  volume: NaN,
  totalLiquidity: NaN,
}

export const AllPools = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const neckworkEnabled = useNeckworkEnabled()

  const squidQuery = useQuery({
    ...platformTotalQuery(useSquidClient()),
    enabled: !neckworkEnabled,
  })

  const neckworkQuery = useQuery({
    ...platformStatsQuery(neckworkClient),
    enabled: neckworkEnabled,
  })

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

  const neckwork = neckworkQuery.data
  const neckworkTotals =
    neckwork &&
    neckwork.omnipoolTvlNorm !== null &&
    neckwork.stablepoolsTvlNorm !== null &&
    neckwork.xykTvlNorm !== null &&
    neckwork.totalTvlNorm !== null
      ? {
          liquidity: Big(neckwork.omnipoolTvlNorm),
          stablepool: Big(neckwork.stablepoolsTvlNorm),
          isolated: Big(neckwork.xykTvlNorm),
          totalLiquidity: Big(neckwork.totalTvlNorm),
          volume: Big(neckwork.omnipoolVolNorm)
            .plus(neckwork.stableswapVolNorm)
            .plus(neckwork.xykVolNorm),
        }
      : NO_TOTALS

  const squid = squidQuery.data
  const squidTotals =
    squid &&
    squid.omnipoolTvlNorm &&
    squid.stablepoolsTvlNorm &&
    squid.omnipoolVolNorm &&
    squid.stableswapVolNorm
      ? {
          liquidity: Big(squid.omnipoolTvlNorm),
          stablepool: Big(squid.stablepoolsTvlNorm),
          isolated: xykTotals.liquidity,
          totalLiquidity: Big(squid.omnipoolTvlNorm)
            .plus(squid.stablepoolsTvlNorm)
            .plus(xykTotals.liquidity),
          volume: Big(squid.omnipoolVolNorm)
            .plus(squid.stableswapVolNorm)
            .plus(xykTotals.volume),
        }
      : { ...NO_TOTALS, isolated: xykTotals.liquidity }

  const totals = neckworkEnabled ? neckworkTotals : squidTotals

  const isLoading = neckworkEnabled
    ? neckworkQuery.isLoading
    : squidQuery.isLoading || isLoadingXYK

  return (
    <>
      <ValueStats
        label={t("liquidity:header.totalLiquidity")}
        value={t("common:currency.compact", {
          value: totals.totalLiquidity,
        })}
        size="medium"
        isLoading={isLoading}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency.compact", {
          value: totals.volume,
        })}
        isLoading={isLoading}
        size="medium"
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.valueInOmnipool")}
        value={t("common:currency.compact", { value: totals.liquidity })}
        size="medium"
        isLoading={isLoading}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.valueInStablepool")}
        value={t("common:currency.compact", { value: totals.stablepool })}
        size="medium"
        isLoading={isLoading}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.valueInIsolatedPools")}
        value={t("common:currency.compact", {
          value: totals.isolated,
        })}
        size="medium"
        isLoading={isLoading}
        wrap
      />
    </>
  )
}
