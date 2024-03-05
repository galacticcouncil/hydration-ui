import { useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import {
  useAccount,
  useEvmAccount,
} from "sections/web3-connect/Web3Connect.utils"
import { isEvmAccount } from "utils/evm"
import { QUERY_KEYS } from "utils/queryKeys"

export function useIsEvmAccountBound() {
  const { api, isLoaded } = useRpcProvider()

  const { account } = useAccount()
  const { account: evmAccount } = useEvmAccount()

  const isEvm = isEvmAccount(account?.address)
  const address = evmAccount?.address ?? ""

  return useQuery({
    enabled: isLoaded && !!address && !isEvm,
    queryKey: QUERY_KEYS.evmBoundAccountId(address),
    initialData: isEvm ? true : undefined,
    queryFn: async () => {
      const result = await api.rpc.state.call(
        "EvmAccountsApi_bound_account_id",
        address,
      )

      const isBound = !result.isEmpty
      return isBound
    },
  })
}
