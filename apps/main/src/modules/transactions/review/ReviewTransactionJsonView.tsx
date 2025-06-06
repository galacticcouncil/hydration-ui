import { JsonView } from "@galacticcouncil/ui/components"

import { JsonViewContainer } from "@/modules/transactions/review/ReviewTransactionJsonView.styled"
import { decodeTx } from "@/modules/transactions/review/ReviewTransactionJsonView.utils"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionJsonView = () => {
  const { tx } = useTransaction()
  const json = decodeTx(tx)
  return (
    <JsonViewContainer>
      <JsonView src={json} />
    </JsonViewContainer>
  )
}
