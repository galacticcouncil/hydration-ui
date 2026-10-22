import { platformStatsQuery } from "@galacticcouncil/indexer/neckwork"
import { ValueStats } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"

import { PoolsHeaderSeparator } from "./PoolsHeaderSeparator"

const NO_TOTALS = {
  liquidity: NaN,
  stablepool: NaN,
  volume: NaN,
  totalLiquidity: NaN,
}

export const Omnipool = () => {
  const { t } = useTranslation(["liquidity", "common"])

  const { data: neckwork, isLoading } = useQuery(
    platformStatsQuery(neckworkClient),
  )

  const totals =
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
