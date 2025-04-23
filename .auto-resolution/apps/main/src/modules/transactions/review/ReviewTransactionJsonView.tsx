import { JsonView } from "@galacticcouncil/ui/components"
import { safeParse } from "@galacticcouncil/utils"
import { Abi, decodeFunctionData, Hex } from "viem"

import { JsonViewContainer } from "@/modules/transactions/review/ReviewTransactionJsonView.styled"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { AnyTransaction } from "@/states/transactions"

const getTxJson = (tx: AnyTransaction) => {
  if (isPapiTransaction(tx)) {
    return tx.decodedCall
  }

  if (isEvmCall(tx)) {
    const abi = tx.abi ? safeParse<Abi>(tx.abi) : null
    if (!abi) return null
    return decodeFunctionData({
      data: tx.data as Hex,
      abi,
    })
  }

  return {}
}

export const ReviewTransactionJsonView = () => {
  const { tx } = useTransaction()
  const json = getTxJson(tx)
  return (
    <JsonViewContainer>
      <JsonView src={json} />
    </JsonViewContainer>
  )
}
