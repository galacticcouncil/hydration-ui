import { Separator, ValueStats } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useXYKPools } from "@/states/liquidity"

export const Isolated = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { data: xykPools = [], isLoading: isLoadingXYK } = useXYKPools()

  const totals = useMemo(() => {
    const totals = xykPools.reduce(
      (acc, asset) => ({
        liquidity: acc.liquidity.plus(asset.tvlDisplay ?? 0),
        volume: acc.volume.plus(asset.volumeDisplay ?? 0),
      }),
      {
        liquidity: Big(0),
        volume: Big(0),
      },
    )

    return {
      liquidity: totals.liquidity.toString(),
      volume: totals.volume.toString(),
    }
  }, [xykPools])

  return (
    <>
      <ValueStats
        label={t("liquidity:header.valueInIsolatedPools")}
        value={t("common:currency", { value: totals.liquidity })}
        isLoading={isLoadingXYK}
        size="medium"
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency", { value: totals.volume })}
        isLoading={false}
        size="medium"
        alwaysWrap
      />
    </>
  )
}
