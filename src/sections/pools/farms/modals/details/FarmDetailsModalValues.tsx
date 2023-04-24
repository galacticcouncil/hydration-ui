import { useAssetMeta } from "api/assetMeta"
import { DepositNftType } from "api/deposits"
import BigNumber from "bignumber.js"
import { useTranslation } from "react-i18next"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useEnteredDate } from "utils/block"
import { useClaimableAmount } from "utils/farms/claiming"
import { useDepositShare } from "../../position/FarmingPosition.utils"
import { WalletAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData"
import { Summary } from "components/Summary/Summary"

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

  const position = useDepositShare(pool.id, depositNft.id.toString())

  if (!position.data) return null

  return (
    <div sx={{ py: 22 }}>
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
            content: (
              <WalletAssetsHydraPositionsData
                fontSize={14}
                symbol={position.data.symbol}
                value={position.data.value}
                lrna={position.data.lrna}
              />
            ),
          },
          {
            label: t("farms.modal.details.mined.label"),
            content: t("farms.modal.details.mined.value", {
              value: depositReward?.value,
              symbol: meta.data?.symbol,
              fixedPointScale: meta.data?.decimals.toString(),
            }),
          },
        ]}
      />
    </div>
  )
}
