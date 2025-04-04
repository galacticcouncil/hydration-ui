import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { useAssets } from "providers/assets"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { SCurrentDeposit } from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit.styled"
import { CurrentDepositBalance } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositBalance"
import { useAssetsPrice } from "state/displayPrice"
import { RemoveDepositModal } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal"
import { getAddressFromAssetId } from "utils/evm"
import { useModalContext } from "sections/lending/hooks/useModal"

export type CurrentDepositData = {
  readonly depositBalance: string
  readonly rewardsBalance: string
}

type Props = {
  readonly assetId: string
  readonly rewardAssetId: string
  readonly depositData: CurrentDepositData
}

export const CurrentDeposit: FC<Props> = ({
  assetId,
  rewardAssetId,
  depositData,
}) => {
  const { t } = useTranslation()
  const { openClaimRewards } = useModalContext()

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)
  const rewardAsset = getAssetWithFallback(rewardAssetId)

  const { getAssetPrice } = useAssetsPrice([assetId, rewardAssetId])
  const spotPrice = getAssetPrice(assetId).price || "0"
  const rewardSpotPrice = getAssetPrice(rewardAssetId).price || "0"

  const depositValue = new BigNumber(spotPrice)
    .times(depositData.depositBalance || "0")
    .toString()

  const rewardsValue = new BigNumber(rewardSpotPrice)
    .times(depositData.rewardsBalance || "0")
    .toString()

  return (
    <SCurrentDeposit>
      <CurrentDepositBalance
        label={t("wallet.strategy.deposit.myDeposit")}
        balance={t("value.tokenWithSymbol", {
          value: depositData.depositBalance,
          symbol: asset.symbol,
        })}
        value={t("value.usd", { amount: depositValue })}
      />
      <Button
        size="small"
        disabled={new BigNumber(depositData.depositBalance).lte(0)}
        onClick={() => setIsRemoveModalOpen(true)}
      >
        {t("remove")}
      </Button>
      <CurrentDepositSeparator />
      <CurrentDepositBalance
        variant="highlight"
        label={t("wallet.strategy.deposit.myRewards")}
        balance={t("value.tokenWithSymbol", {
          value: depositData.rewardsBalance,
          symbol: rewardAsset.symbol,
        })}
        value={t("value.usd", { amount: rewardsValue })}
      />
      <Button
        variant="primary"
        size="small"
        disabled={new BigNumber(depositData.rewardsBalance).lte(0)}
        onClick={() => openClaimRewards(getAddressFromAssetId(rewardAssetId))}
      >
        {t("claim")}
      </Button>
      <Modal
        open={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
      >
        <RemoveDepositModal
          assetId={assetId}
          balance={depositData.depositBalance}
          onClose={() => setIsRemoveModalOpen(false)}
        />
      </Modal>
    </SCurrentDeposit>
  )
}

const CurrentDepositSeparator: FC = () => {
  return (
    <>
      <Separator
        orientation="vertical"
        sx={{ height: "100%", display: ["none", "initial"] }}
      />
      <Separator
        sx={{ display: ["initial", "none"] }}
        css={{ gridColumn: "1/-1" }}
      />
    </>
  )
}
