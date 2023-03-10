import { useAssetMeta } from "api/assetMeta"
import { DepositNftType } from "api/deposits"
import BigNumber from "bignumber.js"
import { useTranslation } from "react-i18next"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useEnteredDate } from "utils/block"
import { useClaimableAmount } from "utils/farms/claiming"
import { useDepositShare } from "../../position/FarmingPosition.utils"
import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"

type FarmDetailsModalValuesProps = {
  pool: OmnipoolPool
  depositNft: DepositNftType
  enteredBlock: BigNumber
  yieldFarmId: string
}

export const FarmDetailsModalValues = ({
  pool,
  depositNft,
  enteredBlock,
  yieldFarmId,
}: FarmDetailsModalValuesProps) => {
  const { t } = useTranslation()
  const claimable = useClaimableAmount(pool, depositNft)
  const depositReward = claimable.data?.depositRewards.find(
    (reward) => reward.yieldFarmId === yieldFarmId,
  )

  const meta = useAssetMeta(depositReward?.assetId)
  const entered = useEnteredDate(enteredBlock)

  const position = useDepositShare(pool.id, [depositNft.id.toString()])
    .data?.[0]

  if (!position) return null

  return (
    <div sx={{ p: "22px 12px 0" }}>
      <div sx={{ flex: "row", justify: "space-between", py: 12 }}>
        <Text fs={14} color="darkBlue200">
          {t("farms.modal.details.joinedOn.label")}
        </Text>
        <Text fs={14} tAlign="right">
          {t("farms.positions.labels.enterDate.value", {
            date: entered.data,
          })}
        </Text>
      </div>
      <Separator />
      <div sx={{ flex: "row", justify: "space-between", py: 12 }}>
        <Text fs={14} color="darkBlue200">
          {t("farms.modal.details.value.label")}
        </Text>
        <WalletAssetsHydraPositionsData
          fontSize={14}
          symbol={position.symbol}
          value={position.value}
          lrna={position.lrna}
        />
      </div>
      <Separator />
      <div sx={{ flex: "row", justify: "space-between", py: 12 }}>
        <Text fs={14} color="darkBlue200">
          {t("farms.modal.details.mined.label")}
        </Text>
        <Text fs={14} tAlign="right">
          {t("farms.modal.details.mined.value", {
            value: depositReward?.value,
            symbol: meta.data?.symbol,
            fixedPointScale: meta.data?.decimals,
          })}
        </Text>
      </div>
    </div>
  )
}
