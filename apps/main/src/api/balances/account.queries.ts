import { AssetBalance } from "@galacticcouncil/sdk-next"
import {
  experimental_streamedQuery as streamedQuery,
  queryOptions,
} from "@tanstack/react-query"
import { useMemo } from "react"

import {
  mergeBalances,
  watchFilteredAccountBalances,
} from "@/api/balances/account.utils"
import {
  AccountBalanceFilter,
  BalanceRecord,
  EMPTY_BALANCES,
} from "@/api/balances/types"
import { getDemoHydrationBalances } from "@/modules/onramp/demo/demoBalances"
import { isDemoAddress } from "@/modules/onramp/demo/demoWallet.config"
import { useAssets } from "@/providers/assetsProvider"
import { TProviderContext } from "@/providers/rpcProvider"
import { toAsyncIterable } from "@/utils/rxjs"

export const useAccountBalanceFilter = (): AccountBalanceFilter | null => {
  const { tokens, stableswap, bonds, xykShareTokens, erc20, native } =
    useAssets()

  return useMemo(() => {
    if (!xykShareTokens?.length || !erc20.length) return null

    const followedTokenIds = new Set([
      ...tokens.map((token) => Number(token.id)),
      ...stableswap.map((token) => Number(token.id)),
      ...bonds.map((token) => Number(token.id)),
      ...xykShareTokens.map((token) => Number(token.id)),
    ])

    followedTokenIds.delete(Number(native.id))

    if (!followedTokenIds.size) return null

    return {
      followedTokenIds: [...followedTokenIds],
      erc20AssetIds: erc20.map((asset) => Number(asset.id)),
    }
  }, [tokens, stableswap, bonds, xykShareTokens, erc20, native.id])
}

export const accountBalancesQuery = (
  { isReady, sdk }: TProviderContext,
  address: string,
  filter: AccountBalanceFilter | null,
) =>
  queryOptions({
    queryKey: [
      "accountBalances",
      address,
      filter?.followedTokenIds,
      filter?.erc20AssetIds,
    ],
    queryFn: isDemoAddress(address)
      ? async () => getDemoHydrationBalances()
      : streamedQuery<AssetBalance[], BalanceRecord>({
          streamFn: ({ signal }) =>
            toAsyncIterable(
              watchFilteredAccountBalances(sdk, address, filter!),
              signal,
            ),
          reducer: mergeBalances,
          initialValue: EMPTY_BALANCES,
        }),
    enabled:
      isDemoAddress(address) ||
      (isReady &&
        !!address &&
        !!filter?.followedTokenIds.length &&
        !!filter?.erc20AssetIds.length),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

export const MAX_WITHDRAW_ALL_QUERY_KEY = ["aave", "maxWithdrawAll"]

export const maxWithdrawAllQuery = (
  { isReady, sdk }: TProviderContext,
  address: string,
) =>
  queryOptions({
    queryKey: [...MAX_WITHDRAW_ALL_QUERY_KEY, address],
    queryFn: () =>
      isDemoAddress(address)
        ? Promise.resolve({})
        : sdk.api.aave.getMaxWithdrawAll(address),
    enabled: isDemoAddress(address) || (isReady && !!address),
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  })
