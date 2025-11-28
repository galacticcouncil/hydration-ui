import { useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

import { useIndexerClient, useSnowbridgeClient } from "@/api/provider"
import { createToastProcessorFn } from "@/modules/transactions/utils/toasts"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useTransactionToastProcessorFn = () => {
  const queryClient = useQueryClient()
  const indexerClient = useIndexerClient()
  const snowbridgeClient = useSnowbridgeClient()
  const { evm } = useRpcProvider()

  return useMemo(
    () =>
      createToastProcessorFn(queryClient, indexerClient, snowbridgeClient, evm),
    [queryClient, indexerClient, snowbridgeClient, evm],
  )
}
