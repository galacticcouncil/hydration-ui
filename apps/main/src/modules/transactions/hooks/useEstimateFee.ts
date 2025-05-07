import { isSS58Address, safeStringify } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"

import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { AnyTransaction } from "@/states/transactions"

type UseEstimateFeeProps = {
  address: string
  tx: AnyTransaction
}

export const useEstimateFee = ({ address, tx: _tx }: UseEstimateFeeProps) => {
  const tx = isPapiTransaction(_tx) ? _tx : null

  return useQuery({
    enabled: !!tx && isSS58Address(address),
    queryKey: ["estimateFee", address, safeStringify(tx?.decodedCall)],
    queryFn: async () => {
      if (!tx) throw new Error("Invalid transaction")
      return tx.getEstimatedFees(address)
    },
  })
}
