import { useTokenLocks } from "api/balances"
import { useMemo } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_NAN, PARACHAIN_BLOCK_TIME } from "utils/constants"
import { arraySearch, sortAssets } from "utils/helpers"
import { useDisplayPrice, useDisplayPrices } from "utils/displayAsset"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAcceptedCurrencies, useAccountCurrency } from "api/payments"
import { useAccountVotes, useOpenGovUnlockedTokens } from "api/democracy"
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
    erc20,
    getAsset,
    tokens,
    getAssetWithFallback,
  } = useAssets()
  const address = givenAddress ?? account?.address

  const rugCheck = useExternalTokensRugCheck()

  const { data: balances, isLoading: isBalancesLoading } =
    useAccountAssets(address)
  const getExternalMeta = useExternalTokenMeta()

  const tokensWithBalance = useMemo(() => {
    if (balances) {
      const filteredTokens =
        balances.balances?.filter((balance) => {
          const meta = getAsset(balance.assetId)

          return (
            meta?.isToken ||
            meta?.isStableSwap ||
            meta?.isExternal ||
            meta?.isErc20
          )
        }) ?? []

      return filteredTokens
    }

    return []
  }, [balances, getAsset])

  const tokensWithBalanceIds = tokensWithBalance.map(
    (tokenWithBalance) => tokenWithBalance.assetId,
  )

  const { data: currencyId } = useAccountCurrency(address)
  const { data: acceptedCurrencies } =
    useAcceptedCurrencies(tokensWithBalanceIds)

  const spotPrices = useDisplayPrices(tokensWithBalanceIds)

  const allAssets = useMemo(
    () => [...tokens, ...stableswap, ...external, ...erc20],
    [external, stableswap, tokens, erc20],
  )

  const data = useMemo(() => {
    if (isBalancesLoading || !spotPrices.data) return []

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
      const spotPrice = spotPrices.data?.find(
        (spotPrice) => spotPrice?.tokenIn === id,
      )?.spotPrice

      const reserved = BigNumber(balance.reservedBalance).shiftedBy(-decimals)
      const reservedDisplay = spotPrice?.isFinite()
        ? reserved.times(spotPrice).toString()
        : undefined

      const total = BigNumber(balance.total).shiftedBy(-decimals)
      const totalDisplay = spotPrice?.isFinite()
        ? total.times(spotPrice).toString()
        : undefined

      const transferable = isExternalInvalid
        ? BN_NAN
        : BigNumber(balance.balance).shiftedBy(-decimals)
      const transferableDisplay = spotPrice?.isFinite()
        ? transferable.times(spotPrice).toString()
        : undefined

      const isAcceptedCurrency = !!acceptedCurrencies?.find(
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
        reserved: reserved.toString(),
        reservedDisplay,
        total: total.toString(),
        totalDisplay,
        transferable: transferable.toString(),
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
                reserved: "0",
                reservedDisplay: "0",
                total: "0",
                totalDisplay: "0",
                transferable: "0",
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
    acceptedCurrencies,
    currencyId,
    isBalancesLoading,
    rugCheck.tokensMap,
  ])

  return { data, isLoading: isBalancesLoading || spotPrices.isInitialLoading }
}

export type AssetsTableData = ReturnType<typeof useAssetsData>["data"][number]

export const useLockedNativeTokens = () => {
  const {
    native: { decimals, id },
  } = useAssets()
  const { data: locks = [], isLoading: isLocksLoading } = useTokenLocks(id)
  const { data: spotPrice, isLoading: isSpotPriceLoading } = useDisplayPrice(id)

  const lockVesting = scaleHuman(
    locks.find((lock) => lock.type === "ormlvest")?.amount ?? "0",
    decimals,
  )

  const lockDemocracy = scaleHuman(
    locks.find((lock) => lock.type === "democrac")?.amount ?? "0",
    decimals,
  )

  const lockOpenGov = scaleHuman(
    locks.find((lock) => lock.type === "pyconvot")?.amount ?? "0",
    decimals,
  )

  const lockStaking = scaleHuman(
    locks.find((lock) => lock.type === "stk_stks")?.amount ?? "0",
    decimals,
  )

  const lockVestingDisplay = lockVesting.times(spotPrice?.spotPrice ?? 1)
  const lockDemocracyDisplay = lockDemocracy.times(spotPrice?.spotPrice ?? 1)
  const lockStakingDisplay = lockStaking.times(spotPrice?.spotPrice ?? 1)
  const lockOpenGovDisplay = lockOpenGov.times(spotPrice?.spotPrice ?? 1)

  return {
    isLoading: isLocksLoading || isSpotPriceLoading,
    lockVesting,
    lockDemocracy,
    lockStaking,
    lockVestingDisplay,
    lockDemocracyDisplay,
    lockStakingDisplay,
    lockOpenGov,
    lockOpenGovDisplay,
  }
}

export const useUnlockableTokens = () => {
  const { native } = useAssets()
  const { lockDemocracy, lockOpenGov, isLoading } = useLockedNativeTokens()
  const { data: unlockedVotes, isLoading: isLoadingVotes } = useAccountVotes()
  const { data: openGovUnlockedVotes, isLoading: isLoadingOpenGov } =
    useOpenGovUnlockedTokens()
  const { data: spotPrice, isLoading: isSpotPriceLoading } = useDisplayPrice(
    native.id,
  )

  const { unlockedValue, endDate } = useMemo(() => {
    if (unlockedVotes && lockDemocracy) {
      const unlockedValue = !lockDemocracy
        ? "0"
        : lockDemocracy
            .minus(unlockedVotes.maxLockedValue.shiftedBy(-native.decimals))
            .toString()
      const lockedSeconds =
        unlockedVotes.maxLockedBlock.times(PARACHAIN_BLOCK_TIME)
      const endDate = !unlockedVotes.maxLockedBlock.isZero()
        ? durationInDaysAndHoursFromNow(
            lockedSeconds?.times(1000).toNumber() ?? 0,
          )
        : undefined

      return { unlockedValue, endDate }
    }

    return { unlockedValue: "0", endDate: undefined }
  }, [unlockedVotes, lockDemocracy, native])

  const { openGovUnlockValue, openGovEndDate } = useMemo(() => {
    if (openGovUnlockedVotes && lockOpenGov) {
      const openGovUnlockValue = !lockOpenGov
        ? "0"
        : lockOpenGov
            .minus(
              BigNumber(openGovUnlockedVotes.maxLockedValue).shiftedBy(
                -native.decimals,
              ),
            )

            .toString()
      let openGovEndDate: undefined | string
      if (openGovUnlockedVotes.maxLockedBlock) {
        const lockedSeconds = BigNumber(
          openGovUnlockedVotes.maxLockedBlock,
        ).times(PARACHAIN_BLOCK_TIME)

        openGovEndDate = !BigNumber(
          openGovUnlockedVotes.maxLockedBlock,
        ).isZero()
          ? durationInDaysAndHoursFromNow(
              lockedSeconds?.times(1000).toNumber() ?? 0,
            )
          : undefined
      }

      return { openGovUnlockValue, openGovEndDate }
    }

    return { openGovUnlockValue: "0", openGovEndDate: undefined }
  }, [openGovUnlockedVotes, lockOpenGov, native])

  const commonUnlockedValue =
    unlockedVotes?.maxLockedValue.gt(openGovUnlockValue) ||
    BigNumber(openGovUnlockedVotes?.maxLockedValue ?? "0").gt(unlockedValue)
      ? BigNumber.min(unlockedValue, openGovUnlockValue)
      : BigNumber.max(unlockedValue, openGovUnlockValue)

  return {
    isLoading:
      isLoadingVotes || isSpotPriceLoading || isLoadingOpenGov || isLoading,
    ids: unlockedVotes?.ids ?? [],
    openGovIds: openGovUnlockedVotes?.ids ?? [],
    unlockedValue: commonUnlockedValue.toString(),
    unlockedDisplayValue: BigNumber(commonUnlockedValue)
      .times(spotPrice?.spotPrice ?? BN_NAN)
      .toString(),
    endDate,
    openGovEndDate,
  }
}

export const useUnlockTokens = ({
  ids,
  openGovIds,
  toast,
}: {
  ids: string[]
  openGovIds: { voteId: string; classId: string }[]
  toast: ToastMessage
}) => {
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { native } = useAssets()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  return useMutation(async () => {
    const txs = ids.map((id) => api.tx.democracy.removeVote(id))

    const openGovTxs = openGovIds.map((id) =>
      api.tx.convictionVoting.removeVote(id.classId, id.voteId),
    )

    const opneGovUnlock = openGovIds.reduce<string[]>((acc, id) => {
      if (acc.find((memoId) => memoId === id.classId)) return acc
      return [...acc, id.classId]
    }, [])

    if (!account?.address) return null

    return await createTransaction(
      {
        tx:
          txs.length || openGovTxs.length
            ? api.tx.utility.batchAll([
                ...txs,
                ...openGovTxs,
                api.tx.democracy.unlock(account.address),
                ...opneGovUnlock.map((classId) =>
                  api.tx.convictionVoting.unlock(classId, account.address),
                ),
              ])
            : api.tx.democracy.unlock(account.address),
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
