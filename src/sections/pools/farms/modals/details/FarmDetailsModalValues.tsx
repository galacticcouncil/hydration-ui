import BigNumber from "bignumber.js"
import { useTranslation } from "react-i18next"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import { useEnteredDate } from "utils/block"
import { useClaimableAmount } from "utils/farms/claiming"
import { useDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { Summary } from "components/Summary/Summary"
import { useRpcProvider } from "providers/rpcProvider"

type FarmDetailsModalValuesProps = {
  poolId: string
  depositNft: TMiningNftPosition
  enteredBlock: BigNumber
  yieldFarmId: string
}

export const FarmDetailsModalValues = ({
  poolId,
  depositNft,
  enteredBlock,
  yieldFarmId,
}: FarmDetailsModalValuesProps) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const claimable = useClaimableAmount(poolId, depositNft)

  const depositReward = claimable.data?.depositRewards.find(
    (reward) => reward.yieldFarmId === yieldFarmId,
  )

  const meta = depositReward?.assetId
    ? assets.getAsset(depositReward.assetId)
    : undefined
  const entered = useEnteredDate(enteredBlock)

  const position = useDepositShare(poolId, depositNft.id.toString())

  if (!position.data) return null

  return (
    <div sx={{ pt: 22 }}>
      <Summary
        rows={[
          {
            label: t("farms.modal.details.joinedOn.label"),
            content: t("farms.positions.labels.enterDate.value", {
              date: entered.data,
            }),
          },
          {
            label: t("farms.modal.details.value.label"),
            content: t("value.tokenWithSymbol", {
              value: position.data.totalValueShifted,
              symbol: meta?.symbol,
            }),
          },
          {
            label: t("farms.modal.details.mined.label"),
            content: t("farms.modal.details.mined.value", {
              value: depositReward?.value,
              symbol: meta?.symbol,
              fixedPointScale: meta?.decimals,
            }),
          },
        ]}
      />
    </div>
  )
}
