import i18n from "@/i18n"
import { PoolChart } from "@/modules/liquidity/components/PoolDetailsChart/PoolDetailsChart"
import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"

import { PoolDetailsValues } from "./PoolDetailsValues"
import { PoolStatsShell } from "./PoolStatsShell"

export { types } from "./PoolStatsShell"

export const chartTypes: ReadonlyArray<{
  id: "price" | "volume"
  label: string
}> = [
  { id: "price", label: i18n.t("price") },
  //{ id: "volume", label: i18n.t("volume") },
]

export const PoolStats = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const isOmnipool = !isIsolatedPool(data)

  return (
    <PoolStatsShell
      values={<PoolDetailsValues data={data} />}
      renderChart={(isMobile) => (
        <PoolChart
          assetId={data.id}
          height={
            isMobile
              ? 350
              : isOmnipool && data.isStablepoolInOmnipool
                ? 500
                : 420
          }
          isEmptyData={!isOmnipool}
        />
      )}
    />
  )
}
