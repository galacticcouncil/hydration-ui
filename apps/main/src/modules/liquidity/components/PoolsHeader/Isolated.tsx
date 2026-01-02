import { ValueStats } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useXYKPools } from "@/states/liquidity"

import { PoolsHeaderSeparator } from "./PoolsHeaderSeparator"

export const Isolated = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { data: xykPools = [], isLoading: isLoadingXYK } = useXYKPools()

  const totals = xykPools.reduce(
    (acc, asset) => ({
      liquidity: acc.liquidity.plus(asset.tvlDisplay || "0"),
      volume: acc.volume.plus(asset.volumeDisplay || "0"),
    }),
    {
      liquidity: Big(0),
      volume: Big(0),
    },
  )

  return (
    <>
      <ValueStats
        label={t("liquidity:header.valueInIsolatedPools")}
        value={t("common:currency", {
          value: totals.liquidity,
        })}
        isLoading={isLoadingXYK}
        size="medium"
        wrap
      />
      <PoolsHeaderSeparator />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency", { value: totals.volume })}
        isLoading={false}
        size="medium"
        wrap
      />
    </>
  )
}
