import { platformStatsQuery } from "@galacticcouncil/indexer/neckwork"
import { platformTotalQuery } from "@galacticcouncil/indexer/squid"
import { ValueStats } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { neckworkClient, useSquidClient } from "@/api/provider"
import { useNeckworkEnabled } from "@/states/neckwork"

import { PoolsHeaderSeparator } from "./PoolsHeaderSeparator"

const NO_TOTALS = {
  liquidity: NaN,
  stablepool: NaN,
  volume: NaN,
  totalLiquidity: NaN,
}

export const Omnipool = () => {
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

  const neckwork = neckworkQuery.data
  const neckworkTotals =
    neckwork &&
    neckwork.omnipoolTvlNorm !== null &&
    neckwork.stablepoolsTvlNorm !== null
      ? {
          liquidity: Big(neckwork.omnipoolTvlNorm),
          stablepool: Big(neckwork.stablepoolsTvlNorm),
          volume: Big(neckwork.omnipoolVolNorm).plus(
            neckwork.stableswapVolNorm,
          ),
          totalLiquidity: Big(neckwork.omnipoolTvlNorm).plus(
            neckwork.stablepoolsTvlNorm,
          ),
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
          volume: Big(squid.omnipoolVolNorm).plus(squid.stableswapVolNorm),
          totalLiquidity: Big(squid.omnipoolTvlNorm).plus(
            squid.stablepoolsTvlNorm,
          ),
        }
      : NO_TOTALS

  const totals = neckworkEnabled ? neckworkTotals : squidTotals

  const isLoading = neckworkEnabled
    ? neckworkQuery.isLoading
    : squidQuery.isLoading

  return (
    <>
      <ValueStats
        label={t("liquidity:header.totalLiquidity")}
        value={t("common:currency.compact", {
          value: totals.totalLiquidity.toString(),
        })}
        size="medium"
        isLoading={isLoading}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency.compact", { value: totals.volume })}
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
    </>
  )
}
