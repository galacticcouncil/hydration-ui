import { FC } from "react"
import { SContainer } from "sections/pools/pool/position/farm/PoolPositionFarm.styled"
import { u32 } from "@polkadot/types"
import { useAPR } from "utils/apr"
import { AccountId32 } from "@polkadot/types/interfaces"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAsset } from "api/asset"
import { Button } from "components/Button/Button"

type Props = { poolId: AccountId32; globalFarmId: u32; yieldFarmId: u32 }

export const PoolPositionFarm: FC<Props> = ({
  poolId,
  globalFarmId,
  yieldFarmId,
}) => {
  const { t } = useTranslation()
  const APRs = useAPR(poolId)
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
          <Button size="small">
            {t("pools.pool.positions.farms.details")}
          </Button>
        </>
      )}
    </SContainer>
  )
}
