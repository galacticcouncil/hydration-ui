import type { Account } from "@galacticcouncil/web3-connect"
import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"

import { depositBalancesQuery } from "@/api/deposit"
import { useCrossChainWallet } from "@/api/xcm"
import {
  getDepositSources,
  getDepositUnavailableReason,
} from "@/modules/onramp/deposit/DepositDiscovery.utils"
import type { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect"

import {
  quickBalanceKey,
  QuickDepositBalances,
} from "./DepositQuickBalances.utils"

/** Query only the selected account and compatible chains while the picker is open. */
export const useQuickDepositBalances = (
  account: Account | undefined,
  pairs: ChainAssetPair[],
  enabled: boolean,
) => {
  const wallet = useCrossChainWallet()
  const sources = useMemo(
    () => (account && enabled ? getDepositSources([account], pairs) : []),
    [account, enabled, pairs],
  )
  const results = useQueries({
    queries: sources.map((source) =>
      depositBalancesQuery(wallet, source.chain, source.account.rawAddress),
    ),
    combine: (items) => ({
      balances: items.map((item) => item.data),
      loading: items.some((item) => item.isPending),
      failed: items.some((item) => item.isError),
    }),
  })
  const balances = useMemo(() => {
    const found: QuickDepositBalances = new Map()
    sources.forEach((source, index) => {
      for (const amount of results.balances[index] ?? []) {
        if (
          amount.amount <= 0n ||
          !source.assets.some((asset) => asset.key === amount.key)
        )
          continue
        const row = {
          key: `${source.key}:${amount.key}`,
          source,
          balance: amount,
        }
        found.set(quickBalanceKey(source.chain.key, amount.key), {
          amount,
          depositable: !getDepositUnavailableReason(row),
        })
      }
    })
    return found
  }, [sources, results.balances])
  return { balances, loading: results.loading, failed: results.failed }
}
