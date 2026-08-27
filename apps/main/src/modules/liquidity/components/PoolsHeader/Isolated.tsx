import { platformStatsQuery } from "@galacticcouncil/indexer/neckwork"
import { ValueStats } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/provider"
import { useXYKPools } from "@/states/liquidity"
import { useNeckworkEnabled } from "@/states/neckwork"

import { PoolsHeaderSeparator } from "./PoolsHeaderSeparator"

const NO_TOTALS = {
  liquidity: NaN,
  volume: NaN,
}

export const Isolated = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const neckworkEnabled = useNeckworkEnabled()

  const { data: xykPools = [], isLoading: isLoadingXYK } = useXYKPools()

  const neckworkQuery = useQuery({
    ...platformStatsQuery(neckworkClient),
    enabled: neckworkEnabled,
  })

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
    neckwork && neckwork.xykTvlNorm !== null
      ? {
          liquidity: Big(neckwork.xykTvlNorm),
          volume: Big(neckwork.xykVolNorm),
        }
      : NO_TOTALS

  const totals = neckworkEnabled ? neckworkTotals : xykTotals

  const isLoading = neckworkEnabled ? neckworkQuery.isLoading : isLoadingXYK

  return (
    <>
      <ValueStats
        label={t("liquidity:header.valueInIsolatedPools")}
        value={t("common:currency.compact", {
          value: totals.liquidity,
        })}
        isLoading={isLoading}
        size="medium"
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
    </>
  )
}
