import { FC } from "react"
import { Text } from "components/Typography/Text/Text"
import { PoolPositionFarm } from "sections/pools/pool/position/farm/PoolPositionFarm"
import { useTranslation } from "react-i18next"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { SContainer } from "sections/pools/pool/position/PoolPosition.styled"
import { usePoolPositionData } from "sections/pools/pool/position/PoolPosition.utils"
import { PoolBase } from "@galacticcouncil/sdk"
import { PoolPositionFarmRedeposit } from "sections/pools/pool/position/farm/PoolPositionFarmRedeposit"
import { getFloatingPointAmount } from "utils/balance"

type Props = {
  index: number
  pool: PoolBase
  position: PalletLiquidityMiningYieldFarmEntry
}

export const PoolPosition: FC<Props> = ({ index, pool, position }) => {
  const { t } = useTranslation()

  const { enteredDate, positionValue, assetA, assetB } = usePoolPositionData({
    position,
    pool,
  })

  return (
    <div key={index}>
      <SContainer>
        <div sx={{ flex: "column", gap: 6 }}>
          <Text fs={12} lh={16} color="neutralGray500">
            {t("pools.pool.positions.position.title", { index })}
          </Text>
          <Text fs={14} lh={18} color="white">
            {t("pools.pool.positions.position.entered", { date: enteredDate })}
          </Text>
        </div>
        <div sx={{ flex: "column", gap: 6 }}>
          <Text fs={12} lh={16} color="neutralGray500">
            {t("pools.pool.positions.position.locked")}
          </Text>
          <Text fs={14} lh={18} color="white" css={{ wordBreak: "break-all" }}>
            {t("pools.pool.positions.position.shares", {
              shares: getFloatingPointAmount(position.valuedShares, 12),
            })}
          </Text>
        </div>
        <div sx={{ flex: "column", gap: 6 }}>
          <Text fs={12} lh={16} color="neutralGray500">
            {t("pools.pool.positions.position.current")}
          </Text>
          <div sx={{ flex: "column", gap: 2 }}>
            <Text fs={14} lh={18} color="white">
              {t("value.usd", { amount: positionValue })}
            </Text>
            <Text fs={12} lh={16} color="neutralGray500">
              {t("pools.pool.positions.position.amounts", {
                amountA: assetA?.amount,
                symbolA: assetA?.symbol,
                amountB: assetB?.amount,
                symbolB: assetB?.symbol,
              })}
            </Text>
          </div>
        </div>
        <PoolPositionFarm pool={pool} position={position} />
      </SContainer>

      <PoolPositionFarmRedeposit pool={pool} />
    </div>
  )
}
