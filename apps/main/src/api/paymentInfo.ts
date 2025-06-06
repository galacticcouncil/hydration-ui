import { queryOptions } from "@tanstack/react-query"
import { Binary } from "polkadot-api"

import { TProviderContext } from "@/providers/rpcProvider"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export const paymentInfoQuery = (
  rpc: TProviderContext,
  tx: Binary | null | undefined,
  accountAddress: string,
) => {
  const { papi, isApiLoaded } = rpc

  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "paymentInfo",
      tx?.asHex(),
      accountAddress,
    ],
    queryFn: async () => {
      if (!tx) {
        return null
      }

      const papiTx = await papi.txFromCallData(tx)
      return await papiTx.getPaymentInfo(accountAddress)
    },
    enabled: isApiLoaded && !!tx && !!accountAddress,
  })
}
