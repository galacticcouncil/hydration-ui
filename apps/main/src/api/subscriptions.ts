import { percentageDifference } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { produce } from "immer"
import { useEffect, useMemo, useState } from "react"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  mapErc20PalletBalances,
  mapNativeBalance,
  mapTokenPalletBalances,
} from "@/api/balances"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { Balance, useAccountData } from "@/states/account"

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

  const followedAssetIds = useMemo(() => {
    if (!xykShareTokens) return new Set<number>()

    const ids = new Set([
      ...tokens.map((token) => Number(token.id)),
      ...stableswap.map((token) => Number(token.id)),
      ...bonds.map((token) => Number(token.id)),
      ...xykShareTokens.map((token) => Number(token.id)),
    ])

    ids.delete(Number(native.id))

    return ids
  }, [tokens, bonds, xykShareTokens, stableswap, native.id])

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
