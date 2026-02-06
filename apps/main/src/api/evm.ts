import { h160 } from "@galacticcouncil/common"
import {
  isEvmParachainAccount,
  QUERY_KEY_BLOCK_PREFIX,
  safeConvertSS58toH160,
  strip0x,
} from "@galacticcouncil/utils"
import {
  EVM_CALL_PERMIT_ABI,
  EVM_CALL_PERMIT_ADDRESS,
} from "@galacticcouncil/web3-connect/src/config/evm"
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns/constants"
import { Binary } from "polkadot-api"
import { isString } from "remeda"
import { getContract, Hex } from "viem"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

const { H160, isEvmAccount, isEvmAddress } = h160

export const evmAccountBindingQuery = (
  { papi, isLoaded }: TProviderContext,
  address: string,
) => {
  return queryOptions({
    enabled: isLoaded && !!address,
    queryKey: ["evm", "accountBinding", address],
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

const permitNonceQuery = (
  { evm, isLoaded }: TProviderContext,
  address: string,
) => {
  const evmAddress = isEvmParachainAccount(address) ? H160.fromAny(address) : ""
  return queryOptions({
    enabled: isLoaded && !!evmAddress,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "evm", "permitNonce", evmAddress],
    queryFn: async () => {
      const callPermitContract = getContract({
        address: EVM_CALL_PERMIT_ADDRESS,
        abi: EVM_CALL_PERMIT_ABI,
        client: evm,
      })
      const nonce = await callPermitContract.read.nonces([evmAddress as Hex])
      return Number(nonce)
    },
  })
}

export const usePermitNonce = (address: string) => {
  return useQuery(permitNonceQuery(useRpcProvider(), address))
}

const pendingPermitQuery = (
  { papiClient, isLoaded }: TProviderContext,
  address: string,
) => {
  const evmAddress = isEvmParachainAccount(address) ? H160.fromAny(address) : ""
  return queryOptions({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "evm", "pendingPermit", evmAddress],
    queryFn: async () => {
      if (!evmAddress) return false

      const pendingExtrinsics = await papiClient._request(
        "author_pendingExtrinsics",
        [],
      )

      if (Array.isArray(pendingExtrinsics)) {
        return pendingExtrinsics.some(
          (ext) => isString(ext) && ext.includes(strip0x(evmAddress)),
        )
      }

      return false
    },
    gcTime: 0,
    enabled: isLoaded && !!evmAddress,
  })
}

export const usePendingPermit = (address: string) => {
  return useQuery(pendingPermitQuery(useRpcProvider(), address))
}
