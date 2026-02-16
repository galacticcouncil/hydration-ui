import { QUERY_KEY_BLOCK_PREFIX, safeStringify } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

import { AnyTransaction } from "@/modules/transactions/types"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { transformAnyToPapiTx } from "@/modules/transactions/utils/tx"
import { TProviderContext } from "@/providers/rpcProvider"

export const paymentInfoQuery = (
  { papi, papiNext, isNext, isApiLoaded }: TProviderContext,
  from: string | undefined,
  anyTx: AnyTransaction,
) => {
  const tx = anyTx ? transformAnyToPapiTx(papi, papiNext, anyTx, isNext) : null
  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "paymentInfo",
      from,
      safeStringify(tx?.decodedCall),
    ],
    queryFn: () => {
      if (!tx) return null
      return tx.getPaymentInfo(from ?? "")
    },
    enabled: isApiLoaded && !!from && isPapiTransaction(tx),
  })
}
