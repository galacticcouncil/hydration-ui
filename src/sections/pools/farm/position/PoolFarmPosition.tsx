import { useTranslation } from "react-i18next"
import { AprFarm } from "utils/farms/apr"
import { PoolBase } from "@galacticcouncil/sdk"
import { Row } from "components/Row/Row"
import { Separator } from "components/Separator/Separator"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { usePoolPositionData } from "../../pool/position/PoolPosition.utils"

export function PoolFarmPosition(props: {
  pool: PoolBase
  farm: AprFarm
  position: PalletLiquidityMiningYieldFarmEntry
}) {
  const { t } = useTranslation()

  const { enteredDate, mined, rewardAsset, assetA, assetB } =
    usePoolPositionData({ position: props.position, pool: props.pool })

  return (
    <div sx={{ flex: "column", gap: 8 }}>
      <Row
        left={t("pools.allFarms.modal.position.joinedDate.label")}
        right={t("pools.allFarms.modal.position.joinedDate.value", {
          date: enteredDate,
        })}
      />
      <Separator />
      <Row
        left={t("pools.allFarms.modal.position.value.label")}
        right={t("pools.allFarms.modal.position.value.value", {
          amountA: assetA?.amount,
          symbolA: assetA?.symbol,
          amountB: assetB?.amount,
          symbolB: assetB?.symbol,
        })}
      />
      <Separator />
      <Row
        left={t("pools.allFarms.modal.position.mined.label")}
        right={t("pools.allFarms.modal.position.mined.value", {
          value: mined,
          fixedPointScale: rewardAsset?.decimals,
          numberSuffix: rewardAsset?.name && ` ${rewardAsset?.name}`,
        })}
      />
    </div>
  )
}
