import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { useAssets } from "providers/assets"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { SCurrentDeposit } from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit.styled"
import { CurrentDepositBalance } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositBalance"
import { GIGADOT_ASSET_ID } from "sections/wallet/strategy/strategy.mock"
import { useAssetsPrice } from "state/displayPrice"
import { ClaimStrategyModal } from "sections/wallet/strategy/Claim/ClaimStrategyModal"
import { RemoveStrategyModal } from "sections/wallet/strategy/Remove/RemoveStrategyModal"
export type DepositData = {
  readonly depositBalance: string
  readonly rewardsBalance: string
}

type Props = {
  readonly depositData: DepositData
}

export const CurrentDeposit: FC<Props> = ({ depositData }) => {
  const { t } = useTranslation()
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(GIGADOT_ASSET_ID)

  const { getAssetPrice } = useAssetsPrice([GIGADOT_ASSET_ID])

  const spotPrice = getAssetPrice(GIGADOT_ASSET_ID).price || "0"
  const depositValue = new BigNumber(spotPrice)
    .times(depositData.depositBalance || "0")
    .toString()
  const rewardsValue = new BigNumber(spotPrice)
    .times(depositData.rewardsBalance || "0")
    .toString()

  return (
    <SCurrentDeposit>
      <CurrentDepositBalance
        label={t("wallet.strategy.deposit.myDeposit")}
        balance={t("value.tokenWithSymbol", {
          value: depositData.depositBalance,
          symbol: asset?.symbol,
        })}
        value={t("value.usd", { amount: depositValue })}
      />
      <Button size="small" onClick={() => setIsRemoveModalOpen(true)}>
        {t("remove")}
      </Button>
      <CurrentDepositSeparator />
      <CurrentDepositBalance
        variant="highlight"
        label={t("wallet.strategy.deposit.myRewards")}
        balance={t("value.tokenWithSymbol", {
          value: depositData.rewardsBalance,
          symbol: asset?.symbol,
        })}
        value={t("value.usd", { amount: rewardsValue })}
      />
      <Button
        variant="primary"
        size="small"
        onClick={() => setIsClaimModalOpen(true)}
      >
        {t("claim")}
      </Button>
      <Modal
        title={t("wallet.strategy.claim.title")}
        open={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      >
        <ClaimStrategyModal onClose={() => setIsClaimModalOpen(false)} />
      </Modal>
      <Modal
        title={t("wallet.strategy.remove.title")}
        open={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
      >
        <RemoveStrategyModal
          onClose={() => setIsRemoveModalOpen(false)}
          balance={depositData.depositBalance}
          assetReceiveId="5"
          assetReceiveAmount="100"
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
