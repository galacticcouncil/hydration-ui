import { useMemo } from "react"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useFarmDepositsTotal } from "sections/pools/farms/position/FarmingPosition.utils"
import { Text } from "components/Typography/Text/Text"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Trans, useTranslation } from "react-i18next"
import BN from "bignumber.js"

export const MyLiquidityTotal = ({
  xykTotal,
  stablePoolTotal,
  isLoading,
}: {
  xykTotal: BN
  stablePoolTotal: BN
  isLoading: boolean
}) => {
  const { t } = useTranslation()
  const omnipoolPositions = useOmnipoolPositionsData()
  const totalFarms = useFarmDepositsTotal()

  const totalOmnipool = useMemo(() => {
    return omnipoolPositions.data.reduce((acc, position) => {
      return acc.plus(position.valueDisplay)
    }, BN_0)
  }, [omnipoolPositions.data])

  const total = xykTotal
    .plus(totalOmnipool)
    .plus(stablePoolTotal)
    .plus(totalFarms.value)

  return (
    <HeaderTotalData
      isLoading={
        isLoading || omnipoolPositions.isInitialLoading || totalFarms.isLoading
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
