import { Account, Web3ConnectModal } from "@galacticcouncil/web3-connect"

import { useSquidClient } from "@/api/provider"

export type RecipientConnectModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountSelect: (account: Account) => void
}

export const RecipientConnectModal: React.FC<RecipientConnectModalProps> = ({
  open,
  onOpenChange,
  onAccountSelect,
}) => {
  const squidSdk = useSquidClient()

  return (
    <Web3ConnectModal
      squidSdk={squidSdk}
      open={open}
      onOpenChange={onOpenChange}
      onAccountSelect={onAccountSelect}
    />
  )
}
