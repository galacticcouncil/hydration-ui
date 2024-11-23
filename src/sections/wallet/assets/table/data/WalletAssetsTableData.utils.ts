import { useTokenLocks } from "api/balances"
import { useMemo } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0, BN_NAN, PARACHAIN_BLOCK_TIME } from "utils/constants"
import { arraySearch, sortAssets } from "utils/helpers"
import { useDisplayPrice, useDisplayPrices } from "utils/displayAsset"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAcceptedCurrencies, useAccountCurrency } from "api/payments"
import { useAccountVotes } from "api/democracy"
import { durationInDaysAndHoursFromNow } from "utils/formatting"
import { ToastMessage, useStore } from "state/store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useExternalTokenMeta } from "sections/wallet/addToken/AddToken.utils"
import { useAssets } from "providers/assets"
import { useExternalTokensRugCheck } from "api/external"
import { useAccountAssets } from "api/deposits"
import BigNumber from "bignumber.js"
import { scaleHuman } from "utils/balance"

export const useAssetsData = ({
  isAllAssets,
  search,
  address: givenAddress,
}: {
  isAllAssets?: boolean
  search?: string
  address?: string
} = {}) => {
  const { account } = useAccount()
  const {
    tradable,
    stableswap,
    external,
    getAsset,
    tokens,
    getAssetWithFallback,
  } = useAssets()
  const address = givenAddress ?? account?.address

  const rugCheck = useExternalTokensRugCheck()

  const balances = useAccountAssets(address)
  const getExternalMeta = useExternalTokenMeta()

  const tokensWithBalance = useMemo(() => {
    if (balances.data) {
      const filteredTokens =
        balances.data.balances?.filter((balance) => {
          const meta = getAsset(balance.assetId)

          return meta?.isToken || meta?.isStableSwap || meta?.isExternal
        }) ?? []

      return filteredTokens
    }

    return []
  }, [balances.data, getAsset])

  const tokensWithBalanceIds = tokensWithBalance.map(
    (tokenWithBalance) => tokenWithBalance.assetId,
  )

  const currencyId = useAccountCurrency(address).data
  const acceptedCurrencies = useAcceptedCurrencies(tokensWithBalanceIds)

  const spotPrices = useDisplayPrices(tokensWithBalanceIds)

  const allAssets = useMemo(
    () => [...tokens, ...stableswap, ...external],
    [external, stableswap, tokens],
  )

  const data = useMemo(() => {
    if (balances.isInitialLoading || !spotPrices.data) return []
    const rowsWithBalance = tokensWithBalance.map((balance) => {
      const asset = getAssetWithFallback(balance.assetId)
      const isExternalInvalid = asset.isExternal && !asset.symbol
      const meta = isExternalInvalid
        ? getExternalMeta(asset.id) ?? asset
        : asset

      const rugCheckData = asset.isExternal
        ? rugCheck.tokensMap.get(asset.id)
        : undefined

      const { decimals, id, name, symbol } = meta
      const inTradeRouter = tradable.some((tradeAsset) => tradeAsset.id === id)
      const spotPrice =
        spotPrices.data?.find((spotPrice) => spotPrice?.tokenIn === id)
          ?.spotPrice ?? BN_NAN

      const reserved = BigNumber(balance.reservedBalance).shiftedBy(-decimals)
      const reservedDisplay = reserved.times(spotPrice)

      const total = BigNumber(balance.total).shiftedBy(-decimals)
      const totalDisplay = total.times(spotPrice)

      const transferable = isExternalInvalid
        ? BN_NAN
        : BigNumber(balance.balance).shiftedBy(-decimals)
      const transferableDisplay = transferable.times(spotPrice).toString()

      const isAcceptedCurrency = !!acceptedCurrencies.data?.find(
        (acceptedCurrencie) => acceptedCurrencie.id === id,
      )?.accepted

      const isPaymentFee = currencyId === id
      const couldBeSetAsPaymentFee = isAcceptedCurrency && !isPaymentFee

      const tradability = {
        canBuy: inTradeRouter,
        canSell: inTradeRouter,
        inTradeRouter,
      }

      return {
        id,
        symbol,
        name,
        meta,
        isPaymentFee,
        couldBeSetAsPaymentFee,
        reserved,
        reservedDisplay,
        total,
        totalDisplay,
        transferable,
        transferableDisplay,
        tradability,
        isExternalInvalid,
        rugCheckData,
      }
    })

    const rows = isAllAssets
      ? [
          ...rowsWithBalance,
          ...allAssets.reduce<typeof rowsWithBalance>((acc, meta) => {
            const { id, symbol, name, isExternal } = meta
            const isWithBalance = rowsWithBalance.some((row) => row.id === id)

            if (!isWithBalance) {
              const inTradeRouter = tradable.some(
                (tradeAsset) => tradeAsset.id === id,
              )

              const tradability = {
                canBuy: inTradeRouter,
                canSell: inTradeRouter,
                inTradeRouter,
              }

              const isExternalInvalid = isExternal && !symbol

              const asset = {
                id,
                symbol,
                name,
                meta,
                isPaymentFee: false,
                couldBeSetAsPaymentFee: false,
                reserved: BN_0,
                reservedDisplay: BN_0,
                total: BN_0,
                totalDisplay: BN_0,
                transferable: BN_0,
                transferableDisplay: "0",
                tradability,
                isExternalInvalid,
                rugCheckData: undefined,
              }

              acc.push(asset)
            }

            return acc
          }, []),
        ]
      : rowsWithBalance

    const sortedAssets = sortAssets(
      rows,
      "transferableDisplay",
      NATIVE_ASSET_ID,
    )

    return search
      ? arraySearch(sortedAssets, search, ["symbol", "name"])
      : sortedAssets
  }, [
    tokensWithBalance,
    spotPrices.data,
    isAllAssets,
    allAssets,
    search,
    getAssetWithFallback,
    getExternalMeta,
    tradable,
    acceptedCurrencies.data,
    currencyId,
    balances.isInitialLoading,
    rugCheck.tokensMap,
  ])

  return { data, isLoading: balances.isLoading || spotPrices.isInitialLoading }
}

export type AssetsTableData = ReturnType<typeof useAssetsData>["data"][number]

export const useLockedNativeTokens = () => {
  const {
    native: { decimals, id },
  } = useAssets()
  const locks = useTokenLocks(id)
  const spotPrice = useDisplayPrice(id)

  const lockVesting = scaleHuman(
    locks.data?.find((lock) => lock.type === "ormlvest")?.amount ?? "0",
    decimals,
  )
  const lockDemocracy = scaleHuman(
    locks.data?.find((lock) => lock.type === "democrac")?.amount ?? "0",
    decimals,
  )

  const lockStaking = scaleHuman(
    locks.data?.find((lock) => lock.type === "stk_stks")?.amount ?? "0",
    decimals,
  )

  const lockVestingDisplay = lockVesting.times(spotPrice.data?.spotPrice ?? 1)
  const lockDemocracyDisplay = lockDemocracy.times(
    spotPrice.data?.spotPrice ?? 1,
  )
  const lockStakingDisplay = lockStaking.times(spotPrice.data?.spotPrice ?? 1)

  return {
    isLoading: locks.isLoading || spotPrice.isLoading,
    lockVesting,
    lockDemocracy,
    lockStaking,
    lockVestingDisplay,
    lockDemocracyDisplay,
    lockStakingDisplay,
  }
}

export const useUnlockableTokens = () => {
  const { native } = useAssets()
  const locks = useTokenLocks(native.id)
  const votes = useAccountVotes()
  const spotPrice = useDisplayPrice(native.id)

  const lockDemocracy = locks.data?.find(
    (lock) => lock.type === "democrac",
  )?.amount

  const value = !lockDemocracy
    ? BN_0
    : BigNumber(lockDemocracy)
        .minus(votes.data?.maxLockedValue ?? 0)
        .shiftedBy(-native.decimals)
  const lockedSeconds = votes.data?.maxLockedBlock.times(PARACHAIN_BLOCK_TIME)
  const endDate =
    votes.data && !votes.data.maxLockedBlock.isZero()
      ? durationInDaysAndHoursFromNow(
          lockedSeconds?.times(1000).toNumber() ?? 0,
        )
      : undefined

  return {
    isLoading: votes.isInitialLoading || spotPrice.isLoading || locks.isLoading,
    ids: votes.data?.ids ?? [],
    value,
    displayValue: value?.times(spotPrice.data?.spotPrice ?? 1),
    votesUnlocked: votes.data?.ids.length,
    endDate,
  }
}

export const useUnlockTokens = ({
  ids,
  toast,
}: {
  ids: string[]
  toast: ToastMessage
}) => {
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { native } = useAssets()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  return useMutation(async () => {
    const txs = ids.map((id) => api.tx.democracy.removeVote(id))

    if (!txs.length) return null

    return await createTransaction(
      {
        tx: api.tx.utility.batchAll([
          ...txs,
          ...(account?.address
            ? [api.tx.democracy.unlock(account.address)]
            : []),
        ]),
      },
      {
        toast,
        onSuccess: () => {
          queryClient.invalidateQueries(
            QUERY_KEYS.lock(account?.address, native.id),
          )
        },
      },
    )
  })
}
