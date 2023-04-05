import { useStore } from "state/store"
import { ReviewTransaction } from "./ReviewTransaction"
import { WalletUpgradeModal } from "sections/wallet/upgrade/WalletUpgradeModal"

export const Transactions = () => {
  const { transactions } = useStore()

  if (!transactions || !transactions.length) return null

  return (
    <>
      <WalletUpgradeModal />
      {transactions.map((transaction) => (
        <ReviewTransaction key={transaction.id} {...transaction} />
      ))}
    </>
  )
}
