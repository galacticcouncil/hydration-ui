import { percentageDifference } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { VoidFn } from "@polkadot/api/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { produce } from "immer"
import { useEffect, useMemo } from "react"

import { AssetType } from "@/api/assets"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { Balance, useAccountData } from "@/states/account"
import { NATIVE_ASSET_ID } from "@/utils/consts"

const ERC20_THRESHOLD = 0.01

const accountSystemBalanceQueryKey = ["accountsBalances"]
const accountTokenBalancesQueryKey = ["accountTokenBalances"]
const accountErc20BalanceQueryKey = ["accountErc20Balance"]

export function useBalanceSubscription() {
  const { isLoaded, sdk } = useRpcProvider()
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const { all, erc20, getErc20AToken, native } = useAssets()

  const setBalance = useAccountData((s) => s.setBalance)

  const accountAddress = account?.address
  const { client, api } = sdk
  const { balance } = client

  const { data: systemBalance, isSuccess: isSuccessSystem } = useQuery<
    Balance | false
  >({
    queryKey: accountSystemBalanceQueryKey,
    queryFn: () => false,
    enabled: false,
    staleTime: Infinity,
  })

  const { data: tokenBalances, isSuccess: isSuccessTokens } = useQuery<
    Map<string, Balance>
  >({
    queryKey: accountTokenBalancesQueryKey,
    queryFn: () => new Map(),
    enabled: false,
    staleTime: Infinity,
  })

  const { data: accountErc20Balances, isSuccess: isSuccessErc20 } = useQuery<
    Map<string, Balance>
  >({
    queryKey: accountErc20BalanceQueryKey,
    queryFn: () => new Map(),
    enabled: false,
    staleTime: Infinity,
  })

  const followedAssetIds = useMemo(
    () =>
      new Set([
        ...Array.from(all.values())
          .filter(
            (token) =>
              token.type !== AssetType.ERC20 && token.id !== NATIVE_ASSET_ID,
          )
          .map((token) => Number(token.id)),
      ]),
    [all],
  )

  const erc20AssetIds = useMemo(() => erc20.map((a) => Number(a.id)), [erc20])

  useEffect(() => {
    if (
      !accountAddress ||
      !isLoaded ||
      !followedAssetIds.size ||
      !erc20AssetIds.length
    )
      return

    console.log("Subscribe to balances")

    let unsubSystemBalance: VoidFn | null = null
    let unsubTokensBalance: VoidFn | null = null
    let unsubErcBalance: VoidFn | null = null

    const subscribeSystemBalance = async () => {
      const subscription = balance
        .subscribeSystemBalance(accountAddress)
        .subscribe({
          next: ({ balance }) => {
            if (balance.total !== 0n) {
              queryClient.setQueryData(accountSystemBalanceQueryKey, {
                ...balance,
                assetId: native.id,
              })
            } else {
              queryClient.setQueryData(accountSystemBalanceQueryKey, false)
            }
          },
        })

      unsubSystemBalance = () => subscription.unsubscribe()
    }

    const subscribeTokensBalance = async () => {
      const subscription = balance
        .subscribeTokensBalance(accountAddress)
        .subscribe({
          next: (balances) => {
            const validBalances = new Map<number, Balance>()

            for (const { id, balance } of balances) {
              if (!followedAssetIds.has(id)) {
                continue
              }

              if (balance.total !== 0n) {
                validBalances.set(id, { ...balance, assetId: id.toString() })
              }

              queryClient.setQueryData(
                accountTokenBalancesQueryKey,
                validBalances,
              )
            }
          },
        })

      unsubTokensBalance = () => subscription.unsubscribe()
    }

    const snapABalances = new Map<number, Balance>([])

    const subscribeErc20Balance = async () => {
      const subscription = balance
        .subscribeErc20Balance(accountAddress, erc20AssetIds)
        .subscribe({
          next: async (balances) => {
            const validBalances = new Map<number, Balance>([])

            let shouldSync = false

            for (const { id: assetId, balance } of balances) {
              if (balance.total !== 0n) {
                const snapBalance = snapABalances.get(assetId)

                validBalances.set(assetId, {
                  ...balance,
                  assetId: assetId.toString(),
                })

                snapABalances.set(assetId, {
                  ...balance,
                  assetId: assetId.toString(),
                })

                const snapTransferable = snapBalance?.transferable ?? 0n
                const { transferable } = balance

                if (
                  snapTransferable !== transferable &&
                  percentageDifference(snapTransferable, transferable).gt(
                    ERC20_THRESHOLD,
                  )
                ) {
                  shouldSync = true
                }
              }
            }

            if (!shouldSync && validBalances.size) {
              return
            }

            const maxReservesMap = await (async () => {
              try {
                const maxReserves =
                  await api.aave.getMaxWithdrawAll(accountAddress)

                return new Map(
                  Object.entries(maxReserves).map(([token, amount]) => [
                    token,
                    amount,
                  ]),
                )
              } catch (error) {
                console.error(error)
                return new Map()
              }
            })()

            const adjustedBalances = produce(validBalances, (validBalances) => {
              for (const [assetId, balance] of validBalances.entries()) {
                const registryId =
                  getErc20AToken(assetId)?.underlyingAssetId ?? ""
                const maxReserve = maxReservesMap.get(registryId)

                if (maxReserve) {
                  balance.transferable = maxReserve.amount
                }
              }
            })

            queryClient.setQueryData(
              accountErc20BalanceQueryKey,
              adjustedBalances,
            )
          },
        })

      unsubErcBalance = () => subscription.unsubscribe()
    }

    subscribeSystemBalance()
    subscribeTokensBalance()
    subscribeErc20Balance()

    return () => {
      console.log("Unsubscribe of balances")
      unsubSystemBalance?.()
      unsubTokensBalance?.()
      unsubErcBalance?.()
    }
  }, [
    accountAddress,
    balance,
    queryClient,
    isLoaded,
    followedAssetIds,
    erc20AssetIds,
    api,
    native.id,
    getErc20AToken,
  ])

  const data = useMemo(() => {
    if (!isSuccessSystem || !isSuccessTokens || !isSuccessErc20) return []

    const accountAssetsMap: Map<string, Balance> = new Map([])
    if (systemBalance) {
      accountAssetsMap.set(native.id, systemBalance)
    }

    if (tokenBalances) {
      for (const [assetId, balance] of tokenBalances.entries()) {
        accountAssetsMap.set(assetId, balance)
      }
    }

    if (accountErc20Balances) {
      for (const [assetId, balance] of accountErc20Balances.entries()) {
        accountAssetsMap.set(assetId, balance)
      }
    }

    return [...accountAssetsMap.values()]
  }, [
    isSuccessErc20,
    isSuccessSystem,
    isSuccessTokens,
    native,
    systemBalance,
    tokenBalances,
    accountErc20Balances,
  ])

  useEffect(() => {
    setBalance(data)
  }, [data, setBalance])
}
