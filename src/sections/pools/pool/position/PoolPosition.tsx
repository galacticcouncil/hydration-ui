import { FC } from "react"
import { Box } from "components/Box/Box"
import { Text } from "components/Typography/Text/Text"
import { PoolPositionFarm } from "sections/pools/pool/position/farm/PoolPositionFarm"
import { useTranslation } from "react-i18next"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { AccountId32 } from "@polkadot/types/interfaces"
import { SContainer } from "sections/pools/pool/position/PoolPosition.styled"
import { usePoolPositionData } from "sections/pools/pool/position/PoolPosition.utils"
import { PoolBase } from "@galacticcouncil/sdk"

type Props = {
  position: PalletLiquidityMiningYieldFarmEntry
  index: number
  pool: PoolBase
  poolId: AccountId32
}

export const PoolPosition: FC<Props> = ({ position, index, pool, poolId }) => {
  const { t } = useTranslation()

  const { enteredDate, positionValue, assetA, assetB } = usePoolPositionData({
    position,
    pool,
    poolId,
  })

  return (
    <SContainer key={index}>
      <Box flex column gap={6}>
        <Text fs={12} lh={16} color="neutralGray500">
          {t("pools.pool.positions.position.title", { index })}
        </Text>
        <Text fs={14} lh={18} color="white">
          {t("pools.pool.positions.position.entered", { date: enteredDate })}
        </Text>
      </Box>
      <Box flex column gap={6}>
        <Text fs={12} lh={16} color="neutralGray500">
          {t("pools.pool.positions.position.locked")}
        </Text>
        <Text fs={14} lh={18} color="white">
          {t("pools.pool.positions.position.shares", {
            shares: position.valuedShares.toBigNumber(),
          })}
        </Text>
      </Box>
      <Box flex column gap={6}>
        <Text fs={12} lh={16} color="neutralGray500">
          {t("pools.pool.positions.position.current")}
        </Text>
        <Box flex column gap={2}>
          <Text fs={14} lh={18} color="white">
            {t("value.usd", { amount: positionValue, decimalPlaces: 6 })}
          </Text>
          <Text fs={12} lh={16} color="neutralGray500">
            {t("pools.pool.positions.position.amounts", {
              amountA: assetA?.amount,
              symbolA: assetA?.symbol,
              amountB: assetB?.amount,
              symbolB: assetB?.symbol,
            })}
          </Text>
        </Box>
      </Box>
      <PoolPositionFarm
        poolId={poolId}
        globalFarmId={position.globalFarmId}
        yieldFarmId={position.yieldFarmId}
      />
    </SContainer>
  )
}
