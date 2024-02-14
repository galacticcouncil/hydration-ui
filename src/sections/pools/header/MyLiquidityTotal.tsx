import { useMemo } from "react"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { useMyStablePoolaTotal } from "./StablePoolsTotal"
import { useXYKPools } from "sections/pools/PoolsPage.utils"
import { Text } from "components/Typography/Text/Text"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Trans, useTranslation } from "react-i18next"

export const MyLiquidityTotal = () => {
  const { t } = useTranslation()
  const omnipoolPositions = useOmnipoolPositionsData()
  const miningPositions = useAllUserDepositShare()
  const stablePoolTotal = useMyStablePoolaTotal()
  const xylPools = useXYKPools(true)

  const xykTotal = useMemo(() => {
    if (xylPools.data) {
      return xylPools.data.reduce((acc, xykPool) => {
        const myTotalDisplay = xykPool.tvlDisplay
          ?.div(100)
          .times(xykPool.shareTokenIssuance?.myPoolShare ?? 1)

        return acc.plus(myTotalDisplay ?? BN_0)
      }, BN_0)
    }
    return BN_0
  }, [xylPools.data])

  const totalOmnipool = useMemo(() => {
    return omnipoolPositions.data.reduce((acc, position) => {
      return acc.plus(position.valueDisplay)
    }, BN_0)
  }, [omnipoolPositions.data])

  const totalFarms = useMemo(() => {
    let calculatedShares = BN_0
    for (const poolId in miningPositions.data) {
      const poolTotal = miningPositions.data[poolId].reduce((memo, share) => {
        return memo.plus(share.valueDisplay)
      }, BN_0)
      calculatedShares = calculatedShares.plus(poolTotal)
    }
    return calculatedShares
  }, [miningPositions.data])

  const total = xykTotal
    .plus(totalOmnipool)
    .plus(stablePoolTotal.value)
    .plus(totalFarms)

  return (
    <HeaderTotalData
      isLoading={
        omnipoolPositions.isInitialLoading ||
        stablePoolTotal.isLoading ||
        xylPools.isInitialLoading
      }
      value={total}
      subValue={
        <Text fs={12} color="white" css={{ opacity: "0.6" }}>
          <Trans t={t} i18nKey="liquidity.header.farms">
            <DisplayValue value={totalFarms} />
          </Trans>
        </Text>
      }
      fontSize={19}
    />
  )
}
