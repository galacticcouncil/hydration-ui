import type { Account } from "@galacticcouncil/web3-connect"
import type { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"

import { depositBalancesQuery } from "@/api/deposit"
import { useCrossChainWallet } from "@/api/xcm"
import {
  getDepositSources,
  getFundedDepositAccounts,
} from "@/modules/onramp/deposit/DepositDiscovery.utils"

/** Check only the selected asset and chain, while retaining all wallet aliases. */
export const useFundedDepositAccounts = (
  accounts: Account[],
  chain?: AnyChain | null,
  asset?: Asset | null,
) => {
  const wallet = useCrossChainWallet()
  const sources = useMemo(
    () =>
      chain && asset
        ? getDepositSources(accounts, [
            { chain, assets: [asset], routes: [], isTagSelect: false },
          ])
        : [],
    [accounts, chain, asset],
  )
  const results = useQueries({
    queries: sources.map((source) =>
      depositBalancesQuery(wallet, source.chain, source.account.rawAddress),
    ),
    combine: (items) => ({
      balances: items.map((item) => item.data),
      isLoading: items.some((item) => item.isPending),
      failed: items.some((item) => item.isError),
    }),
  })
  const funded = useMemo(
    () => getFundedDepositAccounts(sources, results.balances, asset?.key),
    [sources, results.balances, asset?.key],
  )
  return {
    accounts: funded,
    isLoading: results.isLoading,
    failed: results.failed,
  }
}
