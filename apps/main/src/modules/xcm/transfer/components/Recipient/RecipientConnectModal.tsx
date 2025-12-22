import {
  Account,
  WalletMode,
  Web3ConnectModal,
} from "@galacticcouncil/web3-connect"
import { AnyChain } from "@galacticcouncil/xc-core"

import { useSquidClient } from "@/api/provider"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"

export type RecipientConnectModalProps = {
  open: boolean
  destChain: AnyChain | null
  onOpenChange: (open: boolean) => void
  onAccountSelect: (account: Account) => void
}

export const RecipientConnectModal: React.FC<RecipientConnectModalProps> = ({
  open,
  destChain,
  onOpenChange,
  onAccountSelect,
}) => {
  const squidSdk = useSquidClient()

  const walletMode = destChain ? getWalletModeByChain(destChain) : null

  return (
    <Web3ConnectModal
      squidSdk={squidSdk}
      open={open}
      mode={walletMode ?? WalletMode.Default}
      onOpenChange={onOpenChange}
      onAccountSelect={onAccountSelect}
    />
  )
}
