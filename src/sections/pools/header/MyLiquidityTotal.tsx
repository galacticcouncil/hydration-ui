import { useMemo } from "react"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useFarmDepositsTotal } from "sections/pools/farms/position/FarmingPosition.utils"
import { useMyStablePoolaTotal } from "./StablePoolsTotal"
import { useXYKPools } from "sections/pools/PoolsPage.utils"
import { Text } from "components/Typography/Text/Text"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Trans, useTranslation } from "react-i18next"

export const MyLiquidityTotal = () => {
  const { t } = useTranslation()
  const omnipoolPositions = useOmnipoolPositionsData()
  const totalFarms = useFarmDepositsTotal()
  const stablePoolTotal = useMyStablePoolaTotal()
  const xykPools = useXYKPools(true)

  const xykTotal = useMemo(() => {
    if (xykPools.data) {
      return xykPools.data.reduce((acc, xykPool) => {
        const myTotalDisplay = xykPool.tvlDisplay
          ?.div(100)
          .times(xykPool.shareTokenIssuance?.myPoolShare ?? 1)

        return acc.plus(!myTotalDisplay.isNaN() ? myTotalDisplay : BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xykPools.data])

  const totalOmnipool = useMemo(() => {
    return omnipoolPositions.data.reduce((acc, position) => {
      return acc.plus(position.valueDisplay)
    }, BN_0)
  }, [omnipoolPositions.data])

  const total = xykTotal
    .plus(totalOmnipool)
    .plus(stablePoolTotal.value)
    .plus(totalFarms.value)

  return (
    <HeaderTotalData
      isLoading={
        omnipoolPositions.isInitialLoading ||
        stablePoolTotal.isLoading ||
        xykPools.isInitialLoading ||
        totalFarms.isLoading
      }
      value={total}
      subValue={
        <Text fs={12} color="white" css={{ opacity: "0.6" }}>
          <Trans t={t} i18nKey="liquidity.header.farms">
            <DisplayValue value={totalFarms.value} />
          </Trans>
        </Text>
      }
      fontSize={19}
    />
  )
}
