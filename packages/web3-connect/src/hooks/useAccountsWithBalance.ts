import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetAmount } from "@galacticcouncil/xc-core"
import { QueriesResults, queryOptions, useQueries } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo } from "react"
import { partition, pick, sortBy } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  NEAR_PROVIDERS,
  SOLANA_PROVIDERS,
  SUI_PROVIDERS,
  ZCASH_PROVIDERS,
} from "@/config/providers"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount } from "@/hooks"
import { useAccountBalancesMap } from "@/hooks/useAccountBalancesMap"
import { Account, useWeb3Connect } from "@/hooks/useWeb3Connect"
import { readNoirBalance } from "@/utils/zec"

/**
 * Chains whose accounts cannot use Hydration, so their balance is the chain's
 * native token instead of the indexer's. Neckwork also rejects a whole batch
 * on a non-hex id, so NEAR and Zcash accounts must never reach it.
 */
const NATIVE_CHAINS = [
  { providers: SOLANA_PROVIDERS, chainKey: "solana", assetKey: "sol" },
  { providers: SUI_PROVIDERS, chainKey: "sui", assetKey: "sui" },
  { providers: NEAR_PROVIDERS, chainKey: "near", assetKey: "near" },
  { providers: ZCASH_PROVIDERS, chainKey: "zec", assetKey: "zec" },
]

const getNativeChain = (account: Account) =>
  NATIVE_CHAINS.find(({ providers }) => providers.includes(account.provider))

const hasNativeBalance = (account: Account) => !!getNativeChain(account)

const fetchNativeBalance = async (
  chainKey: string,
  assetKey: string,
  address: string,
): Promise<AssetAmount> => {
  const chain = chainsMap.get(chainKey)
  const assetData = chain?.assetsData.get(assetKey)

  if (!chain || !assetData?.decimals) {
    throw new Error(`Invalid native asset ${assetKey} on ${chainKey}`)
  }

  // Zcash reads its balance from Noir, a reader the xcm context registers only
  // once it loads, so it is called directly
  if (chainKey === "zec") {
    return AssetAmount.fromAsset(assetData.asset, {
      amount: await readNoirBalance(address),
      decimals: assetData.decimals,
    })
  }

  return chain.getBalance(assetData.asset, address)
}

const nativeBalanceQueryOptions = (
  chainKey: string,
  assetKey: string,
  address: string,
) =>
  queryOptions({
    queryKey: ["native", "balance", chainKey, address],
    queryFn: () => fetchNativeBalance(chainKey, assetKey, address),
    enabled: !!address,
  })

/**
 * A public key can appear under several providers, so native balances are
 * keyed by provider and native address rather than by public key.
 */
const getNativeBalanceKey = (
  account: Pick<Account, "provider" | "rawAddress">,
) => `${account.provider}-${account.rawAddress}`

/**
 * Token amounts and fiat values are not comparable, so accounts are bucketed
 * before their balances are compared: the active account, then fiat-valued
 * accounts, then native-valued ones, then accounts with no balance at all.
 * Sorting by balance only ever happens within a bucket.
 */
const getSortRank = (account: {
  isActive: boolean
  balance: number | undefined
  balanceSymbol: string | undefined
}) => {
  if (account.isActive) return 0
  if (account.balance === undefined) return 3

  return account.balanceSymbol === undefined ? 1 : 2
}

export const useAccountsWithBalance = (accounts: Account[]) => {
  const { account: currentAccount } = useAccount()
  const { neckwork } = useWeb3ConnectContext()
  const { setBalances } = useWeb3Connect(
    useShallow(pick(["accounts", "setBalances"])),
  )

  const [nativeAccounts, fiatAccounts] = useMemo(
    () => partition(accounts, hasNativeBalance),
    [accounts],
  )

  const { balancesMap, isLoading: areFiatBalancesLoading } =
    useAccountBalancesMap({
      accounts: fiatAccounts,
      neckwork,
    })

  const { nativeBalancesMap, isLoading: areNativeBalancesLoading } = useQueries(
    {
      queries: nativeAccounts.map((account) => {
        const { chainKey, assetKey } = getNativeChain(account)!
        return nativeBalanceQueryOptions(chainKey, assetKey, account.rawAddress)
      }),
      combine: useCallback(
        (
          queries: QueriesResults<
            Array<ReturnType<typeof nativeBalanceQueryOptions>>
          >,
        ) => {
          const nativeBalancesMap = new Map<string, AssetAmount>()

          nativeAccounts.forEach((account, index) => {
            const data = queries[index]?.data

            if (data) {
              nativeBalancesMap.set(getNativeBalanceKey(account), data)
            }
          })

          return {
            isLoading: queries.some((query) => query.isLoading),
            nativeBalancesMap,
          }
        },
        [nativeAccounts],
      ),
    },
  )

  useEffect(() => {
    if (!areFiatBalancesLoading) {
      setBalances(balancesMap)
    }
  }, [balancesMap, areFiatBalancesLoading, setBalances])

  const accountsWithBalances = useMemo(() => {
    const accountsWithActive = accounts.map((account) => {
      const isActive =
        currentAccount?.address === account.address &&
        currentAccount?.provider === account.provider

      const nativeBalance = nativeBalancesMap.get(getNativeBalanceKey(account))

      const balance = hasNativeBalance(account)
        ? nativeBalance?.toBigDecimal().toNumber()
        : account.balance

      return {
        ...account,
        isActive,
        balance,
        balanceSymbol: nativeBalance?.originSymbol,
      }
    })

    return sortBy(
      accountsWithActive,
      [getSortRank, "asc"],
      [(item) => item.balance ?? 0, "desc"],
    )
  }, [
    accounts,
    currentAccount?.address,
    currentAccount?.provider,
    nativeBalancesMap,
  ])

  return {
    accountsWithBalances,
    areBalancesLoading: areFiatBalancesLoading || areNativeBalancesLoading,
  }
}
