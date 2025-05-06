import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"
import { AnyPapiTx } from "@/states/transactions"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export const paymentInfoQuery = (
  { isApiLoaded }: TProviderContext,
  from: string | undefined,
  to: string,
  amount: string,
  assetId: string,
  tx: AnyPapiTx,
) => {
  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "paymentInfo",
      from,
      to,
      amount,
      assetId,
    ],
    queryFn: () => tx.getPaymentInfo(from ?? ""),
    enabled: isApiLoaded && !!from,
  })
}
