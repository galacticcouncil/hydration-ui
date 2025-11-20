import { WhTransfer } from "@galacticcouncil/xcm-sdk"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ReviewTransactionError } from "sections/transaction/ReviewTransactionError"
import { SubmittingTransactionContent } from "sections/wallet/assets/wormhole/components/SubmittingTransactionContent"
import {
  useWormholeDepositRedeem,
  useWormholeRedeemStore,
  useWormholeWithdrawRedeem,
} from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.utils"
import { Web3ConnectDirectChainModal } from "sections/web3-connect/chain/Web3ConnectDirectChainModal"
import { WalletAccount } from "sections/web3-connect/types"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getDesiredWalletMode } from "sections/xcm/XcmPage.utils"
import { HYDRATION_CHAIN_KEY } from "utils/constants"

export type RedeemMode = "deposit" | "withdraw"

export type RedeemButtonProps = {
  transfer: WhTransfer
}

const AVG_CLAIM_MINUTES_DURATION = 5

export const RedeemButton: React.FC<RedeemButtonProps> = ({ transfer }) => {
  const isDeposit = transfer.toChain.key === HYDRATION_CHAIN_KEY

  return isDeposit ? (
    <RedeemDepositButton transfer={transfer} />
  ) : (
    <RedeemWithdrawButton transfer={transfer} />
  )
}

type RedeemActionButtonProps = {
  transfer: WhTransfer
}

export const RedeemDepositButton: React.FC<RedeemActionButtonProps> = ({
  transfer,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { pendingRedeemIds } = useWormholeRedeemStore()

  const address = account?.address ?? ""

  const { redeem, operation } = transfer
  const isPending = pendingRedeemIds.includes(operation.id)

  const { mutate, isLoading } = useWormholeDepositRedeem(address)

  return (
    <Button
      size="micro"
      disabled={!redeem || isLoading || isPending}
      isLoading={isLoading || isPending}
      onClick={() => mutate(transfer)}
    >
      {isPending
        ? t("wormhole.transfers.table.button.claiming", {
            duration: AVG_CLAIM_MINUTES_DURATION,
          })
        : t("claim")}
    </Button>
  )
}

export const RedeemWithdrawButton: React.FC<RedeemActionButtonProps> = ({
  transfer,
}) => {
  const { t } = useTranslation()
  const { pendingRedeemIds } = useWormholeRedeemStore()
  const { redeem, operation, toChain } = transfer

  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isPending = pendingRedeemIds.includes(operation.id)

  const { mutate, isLoading } = useWormholeWithdrawRedeem({
    onSubmitted: () => {
      setIsSubmitting(false)
      setOpen(false)
    },
  })

  const [open, setOpen] = useState(false)

  const walletMode = getDesiredWalletMode(toChain.key)

  const handleAccountSelect = (account: WalletAccount) => {
    setIsSubmitting(true)
    mutate([transfer, account], {
      onError: (error) => {
        setIsSubmitting(false)
        setError(error instanceof Error ? error.message : "Unknown error")
      },
    })
  }

  return (
    <>
      <Button
        size="micro"
        disabled={!redeem || isPending || isLoading}
        isLoading={isPending || isLoading}
        onClick={() => setOpen(true)}
      >
        {isPending
          ? t("wormhole.transfers.table.button.claiming", {
              duration: AVG_CLAIM_MINUTES_DURATION,
            })
          : t("claim")}
      </Button>
      <Modal open={!!error} onClose={() => setError("")}>
        <ReviewTransactionError error={error} onClose={() => setError("")} />
      </Modal>
      <Modal open={isSubmitting} onClose={() => setIsSubmitting(false)}>
        <SubmittingTransactionContent />
      </Modal>
      <Web3ConnectDirectChainModal
        open={open}
        onClose={() => setOpen(false)}
        walletMode={walletMode}
        onAccountSelect={handleAccountSelect}
      />
    </>
  )
}
