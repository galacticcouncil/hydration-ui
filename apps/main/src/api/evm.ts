import { isEvmAccount, isEvmAddress } from "@galacticcouncil/sdk"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns/constants"
import { Binary } from "polkadot-api"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const evmAccountBindingQuery = (
  { papi, isLoaded }: TProviderContext,
  address: string,
) => {
  return queryOptions({
    enabled: isLoaded && !!address,
    queryKey: ["EvmAccountBinding", address],
    staleTime: millisecondsInHour,
    queryFn: async () => {
      const isEvm = isEvmAddress(address) || isEvmAccount(address)
      if (isEvm) return true

      const evmAddress = safeConvertSS58toH160(address)

      const res = await papi.apis.EvmAccountsApi.bound_account_id(
        Binary.fromHex(evmAddress),
        {
          at: "best",
        },
      )

      return !!res
    },
  })
}

export const useBindEvmAccount = (address: string) => {
  const rpc = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const tx = rpc.papi.tx.EVMAccounts.bind_evm_address()

      return createTransaction(
        {
          tx,
        },
        {
          onSuccess: () =>
            queryClient.invalidateQueries(evmAccountBindingQuery(rpc, address)),
        },
      )
    },
  })
}
