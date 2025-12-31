import { platformTotalQuery } from "@galacticcouncil/indexer/squid"
import { ValueStats } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"

import { PoolsHeaderSeparator } from "./PoolsHeaderSeparator"

export const Omnipool = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const {
    data: platformTotal,
    isLoading: isLoadingPlatformTotal,
    isSuccess,
  } = useQuery(platformTotalQuery(useSquidClient()))

  const totals = isSuccess
    ? {
        liquidity: Big(platformTotal?.omnipoolTvlNorm ?? "0"),
        stablepool: Big(platformTotal?.stablepoolsTvlNorm ?? "0"),
        volume: Big(platformTotal?.omnipoolVolNorm ?? "0").plus(
          platformTotal?.stableswapVolNorm ?? "0",
        ),
        totalLiquidity: Big(platformTotal?.omnipoolTvlNorm ?? "0").plus(
          platformTotal?.stablepoolsTvlNorm ?? "0",
        ),
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
          value: totals.totalLiquidity.toString(),
        })}
        size="medium"
        isLoading={isLoadingPlatformTotal}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.valueInOmnipool")}
        value={t("common:currency", { value: totals.liquidity })}
        size="medium"
        isLoading={isLoadingPlatformTotal}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.valueInStablepool")}
        value={t("common:currency", { value: totals.stablepool })}
        size="medium"
        isLoading={isLoadingPlatformTotal}
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency", { value: totals.volume })}
        isLoading={isLoadingPlatformTotal}
        size="medium"
        wrap
      />
    </>
  )
}
