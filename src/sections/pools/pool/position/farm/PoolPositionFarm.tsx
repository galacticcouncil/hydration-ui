import { FC, useState } from "react"
import { SContainer } from "sections/pools/pool/position/farm/PoolPositionFarm.styled"
import { u32 } from "@polkadot/types"
import { useAPR } from "utils/apr"
import { AccountId32 } from "@polkadot/types/interfaces"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAsset } from "api/asset"
import { Button } from "components/Button/Button"
import { PoolJoinFarm } from "sections/pools/pool/modals/joinFarm/PoolJoinFarm"
import { PoolBase } from "@galacticcouncil/sdk"

type Props = { pool: PoolBase; globalFarmId: u32; yieldFarmId: u32 }

export const PoolPositionFarm: FC<Props> = ({
  pool,
  globalFarmId,
  yieldFarmId,
}) => {
  const { t } = useTranslation()
  const [openFarm, setOpenFarm] = useState(false)

  const APRs = useAPR(pool.address)
  const apr = APRs.data.find(
    (apr) =>
      apr.yieldFarm.id.eq(yieldFarmId) && apr.globalFarm.id.eq(globalFarmId),
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
      <PoolJoinFarm
        pool={pool}
        isOpen={openFarm}
        onClose={() => setOpenFarm(false)}
        onSelect={() => setOpenFarm(false)}
        initialFarm={{ globalFarmId, yieldFarmId }}
      />
    </SContainer>
  )
}
