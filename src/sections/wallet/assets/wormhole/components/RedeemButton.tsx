import { WhTransfer } from "@galacticcouncil/xcm-sdk"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import {
  useWormholeRedeem,
  useWormholeRedeemStore,
} from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export type RedeemButtonProps = {
  transfer: WhTransfer
}

const AVG_CLAIM_MINUTES_DURATION = 5

export const RedeemButton: React.FC<RedeemButtonProps> = ({ transfer }) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { pendingRedeemIds } = useWormholeRedeemStore()

  const address = account?.address ?? ""

  const { redeem, operation } = transfer
  const isPending = pendingRedeemIds.includes(operation.id)

  const { mutate, isLoading } = useWormholeRedeem(address)

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
