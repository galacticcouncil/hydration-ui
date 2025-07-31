import { Flex, Separator, ValueStats } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useOmnipoolAssets, useXYKPools } from "@/states/liquidity"

export const PoolsHeader = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { data = [], isLoading } = useOmnipoolAssets()
  const { data: xykPools = [], isLoading: isLoadingXYK } = useXYKPools()

  const xykTotal = useMemo(() => {
    return xykPools
      .reduce((acc, asset) => acc.plus(asset.tvlDisplay ?? 0), Big(0))
      .toString()
  }, [xykPools])

  const totals = useMemo(() => {
    const totals = data.reduce(
      (acc, asset) => ({
        liquidity: acc.liquidity.plus(asset.tvlDisplay ?? 0),
      }),
      {
        liquidity: Big(0),
      },
    )

    return {
      liquidity: totals.liquidity.toString(),
    }
  }, [data])

  return (
    <Flex gap={20} justify="space-between" sx={{ overflowX: "auto" }}>
      <ValueStats
        label={t("liquidity:header.totalLiquidity")}
        value={t("common:currency", {
          value: Big(totals.liquidity).plus(xykTotal).toString(),
        })}
        size="medium"
        isLoading={isLoading || isLoadingXYK}
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.volume")}
        value={t("common:currency", { value: 1000000 })}
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
        value={t("common:currency", { value: 1000000 })}
        size="medium"
        alwaysWrap
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("liquidity:header.valueInIsolatedPools")}
        value={t("common:currency", { value: xykTotal })}
        size="medium"
        alwaysWrap
      />
    </Flex>
  )
}
