import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { paymentInfoQuery } from "@/api/transaction"
import { AnyTransaction } from "@/modules/transactions/types"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useTransactionPaymentInfo = (anyTx: AnyTransaction) => {
  const { account } = useAccount()
  return useQuery(paymentInfoQuery(useRpcProvider(), account?.address, anyTx))
}
