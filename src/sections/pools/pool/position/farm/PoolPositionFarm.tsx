import { FC, useState } from "react"
import { SContainer } from "sections/pools/pool/position/farm/PoolPositionFarm.styled"
import { useAPR } from "utils/farms/apr"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAsset } from "api/asset"
import { Button } from "components/Button/Button"
import { PoolBase } from "@galacticcouncil/sdk"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { PoolFarmPositionDetail } from "sections/pools/farm/modals/positionDetail/PoolFarmPositionDetail"

type Props = {
  pool: PoolBase
  position: PalletLiquidityMiningYieldFarmEntry
}

export const PoolPositionFarm: FC<Props> = ({ pool, position }) => {
  const { t } = useTranslation()
  const [openFarm, setOpenFarm] = useState(false)

  const APRs = useAPR(pool.address)
  const apr = APRs.data.find(
    (apr) =>
      apr.yieldFarm.id.eq(position.yieldFarmId) &&
      apr.globalFarm.id.eq(position.globalFarmId),
  )
  const asset = useAsset(apr?.assetId)

  return (
    <SContainer>
      {apr && asset.data && (
        <>
          <Text fs={12} lh={16} color="neutralGray500">
            {t("pools.pool.positions.farms.joinedFarms")}
          </Text>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            {asset.data.icon}
            <Text fs={14} lh={16} color="primary200">
              {t("value.APR", { apr: apr.apr })}
            </Text>
          </div>
          <Button size="small" onClick={() => setOpenFarm(true)}>
            {t("pools.pool.positions.farms.details")}
          </Button>
        </>
      )}
      {openFarm && (
        <PoolFarmPositionDetail
          pool={pool}
          isOpen={openFarm}
          onClose={() => setOpenFarm(false)}
          onSelect={() => setOpenFarm(false)}
        />
      )}
    </SContainer>
  )
}
