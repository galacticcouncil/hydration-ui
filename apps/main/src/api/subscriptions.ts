import { percentageDifference } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { produce } from "immer"
import { useEffect, useMemo, useState } from "react"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  getFollowedAssetIds,
  mapErc20PalletBalances,
  mapNativeBalance,
  mapTokenPalletBalances,
} from "@/api/balances"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { Balance, useAccountData } from "@/states/account"
import {
  readAccountBalances,
  writeAccountBalances,
} from "@/states/accountBalancesCache"

const ERC20_THRESHOLD = 0.01

export function useAccountBalanceSubscription() {
  const { isApiLoaded, sdk } = useRpcProvider()
  const { account } = useAccount()
  const accountAddress = account?.address
  const queryClient = useQueryClient()
  const {
    erc20,
    tokens,
    getErc20AToken,
    native,
    xykShareTokens,
    stableswap,
    bonds,
  } = useAssets()

  const { setBalance, resetBalances, balancesLoaded } = useAccountData(
    useShallow(pick(["setBalance", "resetBalances", "balancesLoaded"])),
  )

  const { client, api } = sdk
  const { balance } = client
  const [isSystemBalanceLoaded, setIsSystemBalanceLoaded] = useState(false)
  const [isTokensBalanceLoaded, setIsTokensBalanceLoaded] = useState(false)
  const [isErcBalanceLoaded, setIsErcBalanceLoaded] = useState(false)

  useEffect(() => {
    resetBalances()
    setIsSystemBalanceLoaded(false)
    setIsTokensBalanceLoaded(false)
    setIsErcBalanceLoaded(false)
  }, [accountAddress, resetBalances])

  /**
   * Paints last session's balances while the live subscriptions connect. This
   * effect depends on the address alone, so it fires as soon as the wallet is
   * restored — the subscription effect below additionally waits on the asset
   * registry, and that wait is most of the delay being hidden here.
   *
   * `isBalanceLoading` stays true until all three subscriptions have emitted,
   * so nothing restored from disk can be submitted as a transaction.
   *
   * Applied only into an empty store: `setBalance` merges, so a read that
   * resolves late would otherwise resurrect assets already spent to zero.
   */
  useEffect(() => {
    if (!accountAddress) return

    let cancelled = false

    readAccountBalances(accountAddress).then((balances) => {
      if (cancelled || !balances) return
      if (Object.keys(useAccountData.getState().balances).length) return

      setBalance(balances)
    })

    return () => {
      cancelled = true
    }
  }, [accountAddress, setBalance])

  /**
   * Writes the whole record on every store change — a partial snapshot beats
   * none, and it self-heals the moment live data lands. The empty guard is
   * what keeps `resetBalances()` on disconnect from wiping a good cache.
   */
  useEffect(() => {
    if (!accountAddress) return

    return useAccountData.subscribe((state) => {
      const balances = Object.values(state.balances)
      if (!balances.length) return

      // ponytail: one IndexedDB write per emit, unthrottled. The React
      // re-render it rides along with costs more; throttle if a profile
      // ever says otherwise.
      void writeAccountBalances(accountAddress, balances)
    })
  }, [accountAddress])

  const followedAssetIds = useMemo(
    () =>
      getFollowedAssetIds({
        tokens,
        stableswap,
        bonds,
        xykShareTokens,
        nativeId: native.id,
      }),
    [tokens, bonds, xykShareTokens, stableswap, native.id],
  )

  const erc20AssetIds = useMemo(() => erc20.map((a) => Number(a.id)), [erc20])

  useEffect(() => {
    if (
      !accountAddress ||
      !isApiLoaded ||
      !followedAssetIds.size ||
      !erc20AssetIds.length
    )
      return

    const subscribeSystemBalance = () =>
      balance.watchSystemBalance(accountAddress).subscribe({
        next: ({ balance: systemBalance }) => {
          setBalance([mapNativeBalance(native.id, systemBalance)])

          setIsSystemBalanceLoaded(true)
        },
      })

    const subscribeTokensBalance = () =>
      balance.watchTokensBalance(accountAddress).subscribe({
        next: (balances) => {
          setBalance(mapTokenPalletBalances(balances, followedAssetIds))

          setIsTokensBalanceLoaded(true)
        },
      })

    const snapABalances = new Map<number, Balance>([])

    const subscribeErc20Balance = () =>
      balance.watchErc20Balance(accountAddress, erc20AssetIds).subscribe({
        next: async (balances) => {
          const validBalances = new Map<number, Balance>(
            mapErc20PalletBalances(balances).map((entry) => [
              Number(entry.assetId),
              entry,
            ]),
          )

          let shouldSync = false

          for (const [assetId, entry] of validBalances.entries()) {
            const snapBalance = snapABalances.get(assetId)

            snapABalances.set(assetId, entry)

            const snapTransferable = snapBalance?.transferable ?? 0n
            const { transferable } = entry

            if (
              snapTransferable !== transferable &&
              percentageDifference(snapTransferable, transferable).gt(
                ERC20_THRESHOLD,
              )
            ) {
              shouldSync = true
            }
          }

          if (shouldSync || !validBalances.size) {
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

            setBalance(Array.from(adjustedBalances.values()))
          }

          setIsErcBalanceLoaded(true)
        },
      })

    const systemSubscription = subscribeSystemBalance()
    const tokenSubscription = subscribeTokensBalance()
    const ercSubscription = subscribeErc20Balance()

    return () => {
      systemSubscription.unsubscribe()
      tokenSubscription.unsubscribe()
      ercSubscription.unsubscribe()
    }
  }, [
    accountAddress,
    balance,
    queryClient,
    isApiLoaded,
    followedAssetIds,
    erc20AssetIds,
    api,
    native.id,
    getErc20AToken,
    setBalance,
  ])

  const isLoaded =
    isSystemBalanceLoaded && isTokensBalanceLoaded && isErcBalanceLoaded

  useEffect(() => {
    if (isLoaded) {
      balancesLoaded()
    }
  }, [isLoaded, balancesLoaded])
}
