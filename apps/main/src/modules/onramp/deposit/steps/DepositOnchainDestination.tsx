import { Account } from "@galacticcouncil/web3-connect"

import { RecipientSelectPage } from "@/modules/xcm/transfer/components/Recipient/RecipientSelectPage"

type Props = {
  onBack: () => void
  onSelect: (address: string, account?: Account) => void
}

export const DepositOnchainDestination = ({ onBack, onSelect }: Props) => (
  <RecipientSelectPage onBack={onBack} onSelectAddress={onSelect} />
)
