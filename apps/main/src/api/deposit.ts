import {
  formatSourceChainAddress,
  isAddressValidOnHydration,
} from "@galacticcouncil/utils"
import { AnyChain } from "@galacticcouncil/xc-core"
import { Wallet } from "@galacticcouncil/xc-sdk"
import { queryOptions } from "@tanstack/react-query"

import { createDepositRequestLimiter } from "@/api/deposit.utils"
import { TProviderContext } from "@/providers/rpcProvider"

const runSnapshot = createDepositRequestLimiter(4)

export const depositBalancesQuery = (
  wallet: Wallet,
  chain: AnyChain,
  address: string,
) =>
  queryOptions({
    queryKey: [
      "deposit",
      "balances",
      chain.key,
      formatSourceChainAddress(address, chain),
    ],
    staleTime: 30_000,
    retry: 1,
    queryFn: ({ signal }) =>
      runSnapshot(async () => {
        signal.throwIfAborted()
        const balances = await wallet.getBalances(
          formatSourceChainAddress(address, chain),
          chain,
        )
        signal.throwIfAborted()
        return balances
      }),
  })

export const depositRecipientQuery = (
  { papi, isReady }: TProviderContext,
  address: string,
) =>
  queryOptions({
    queryKey: ["deposit", "recipient", address],
    enabled: isReady && isAddressValidOnHydration(address),
    staleTime: 30_000,
    queryFn: () => papi.query.System.Account.getValue(address, { at: "best" }),
  })
