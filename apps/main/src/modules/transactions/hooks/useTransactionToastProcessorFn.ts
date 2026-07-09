import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

import { useIndexerClient } from "@/api/provider"
import { createToastProcessorFn } from "@/modules/transactions/utils/toasts"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useTransactionToastProcessorFn = () => {
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const indexerClient = useIndexerClient()
  const { evm } = useRpcProvider()

  return useMemo(
    () =>
      createToastProcessorFn(
        account?.address ?? "",
        queryClient,
        indexerClient,
        evm,
      ),
    [account?.address, queryClient, indexerClient, evm],
  )
}
