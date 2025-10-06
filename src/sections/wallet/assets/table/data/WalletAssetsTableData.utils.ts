import { useTokenLocks } from "api/balances"
import { useMemo } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_NAN, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { arraySearch, sortAssets } from "utils/helpers"
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
import { AccountBalance, useAccountBalances } from "api/deposits"
import BigNumber from "bignumber.js"
import { scaleHuman } from "utils/balance"
import { useAssetsPrice } from "state/displayPrice"
import { useCreateBatchTx } from "sections/transaction/ReviewTransaction.utils"

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
  const { stableswap, external, erc20, tokens } = useAssets()
  const address = givenAddress ?? account?.address

  const rugCheck = useExternalTokensRugCheck()

  const { data: accountAssets, isLoading: isBalancesLoading } =
    useAccountBalances(address)
  const getExternalMeta = useExternalTokenMeta()

  const { balances } = accountAssets ?? {}

  const { tokensWithBalance, validTokensIdsWithBalance } = useMemo(() => {
    if (balances?.length) {
      const tokensWithBalance: AccountBalance[] = []
      const validTokensIdsWithBalance: string[] = []

      for (const accountBalance of balances) {
        const { asset, balance } = accountBalance

        const isVisible =
          asset.id === GDOT_STABLESWAP_ASSET_ID
            ? BigNumber(balance.total).shiftedBy(-asset.decimals).gt(1)
            : true

        if (asset && isVisible) {
          if (
            asset.isToken ||
            asset.isStableSwap ||
            asset.isExternal ||
            asset.isErc20
          ) {
            tokensWithBalance.push(accountBalance)

            if (asset.symbol) {
              validTokensIdsWithBalance.push(asset.id)
            }
          }
        }
      }

      return { tokensWithBalance, validTokensIdsWithBalance }
    }

    return { tokensWithBalance: [], validTokensIdsWithBalance: [] }
  }, [balances])

  const { data: currencyId } = useAccountCurrency(address)
  const { data: acceptedCurrencies } = useAcceptedCurrencies(
    validTokensIdsWithBalance,
  )

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(
    validTokensIdsWithBalance,
  )

  const allAssets = useMemo(
    () => [...tokens, ...stableswap, ...external, ...erc20],
    [external, stableswap, tokens, erc20],
  )

  const data = useMemo(() => {
    if (isBalancesLoading || isPriceLoading) return []

    const rowsWithBalance = tokensWithBalance.map((accountBalance) => {
      const { balance, asset } = accountBalance

      const isExternalInvalid = asset.isExternal && !asset.symbol
      const meta = isExternalInvalid
        ? getExternalMeta(asset.id) ?? asset
        : asset

      const rugCheckData = asset.isExternal
        ? rugCheck.tokensMap.get(asset.id)
        : undefined

      const { decimals, id, name, symbol } = meta
      const inTradeRouter = asset.isTradable
      const spotPrice = getAssetPrice(id).price

      const reserved = BigNumber(balance.reserved).shiftedBy(-decimals)
      const reservedDisplay =
        spotPrice && BigNumber(spotPrice).isFinite()
          ? reserved.times(spotPrice).toString()
          : undefined

      const total = BigNumber(balance.total).shiftedBy(-decimals)
      const totalDisplay =
        spotPrice && BigNumber(spotPrice).isFinite()
          ? total.times(spotPrice).toString()
          : undefined

      const transferable = isExternalInvalid
        ? BN_NAN
        : BigNumber(balance.transferable).shiftedBy(-decimals)
      const transferableDisplay =
        spotPrice && BigNumber(spotPrice).isFinite()
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
            const { id, symbol, name, isExternal, isTradable } = meta
            const isWithBalance = rowsWithBalance.some((row) => row.id === id)

            if (!isWithBalance && id !== GDOT_STABLESWAP_ASSET_ID) {
              const tradability = {
                canBuy: isTradable,
                canSell: isTradable,
                inTradeRouter: isTradable,
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

    const sortedAssets = sortAssets(rows, "transferableDisplay", {
      firstAssetId: NATIVE_ASSET_ID,
    })

    return search
      ? arraySearch(sortedAssets, search, ["symbol", "name"])
      : sortedAssets
  }, [
    tokensWithBalance,
    isAllAssets,
    allAssets,
    search,
    getExternalMeta,
    acceptedCurrencies,
    currencyId,
    isBalancesLoading,
    rugCheck.tokensMap,
    getAssetPrice,
    isPriceLoading,
  ])

  return { data, isLoading: isBalancesLoading || isPriceLoading }
}

export type AssetsTableData = ReturnType<typeof useAssetsData>["data"][number]

export const useLockedNativeTokens = () => {
  const {
    native: { decimals, id },
  } = useAssets()
  const { data: locks = [], isLoading: isLocksLoading } = useTokenLocks(id)
  const { getAssetPrice, isLoading } = useAssetsPrice([id])
  const price = getAssetPrice(id).price

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

  const lockVestingDisplay = lockVesting.times(price)
  const lockDemocracyDisplay = lockDemocracy.times(price)
  const lockStakingDisplay = lockStaking.times(price)
  const lockOpenGovDisplay = lockOpenGov.times(price)

  return {
    isLoading: isLocksLoading || isLoading,
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
  const { slotDurationMs } = useRpcProvider()
  const { native } = useAssets()
  const { lockDemocracy, lockOpenGov, isLoading } = useLockedNativeTokens()
  const { data: unlockedVotes, isLoading: isLoadingVotes } = useAccountVotes()
  const { data: openGovUnlockedVotes, isInitialLoading: isLoadingOpenGov } =
    useOpenGovUnlockedTokens()

  const { getAssetPrice, isLoading: isLoadingPrice } = useAssetsPrice([
    native.id,
  ])

  const { unlockedValue, endDate } = useMemo(() => {
    if (unlockedVotes && lockDemocracy) {
      const unlockedValue = !lockDemocracy
        ? "0"
        : lockDemocracy
            .minus(unlockedVotes.maxLockedValue.shiftedBy(-native.decimals))
            .toString()
      const lockedSeconds = unlockedVotes.maxLockedBlock.times(
        BigNumber(slotDurationMs).div(1000),
      )
      const endDate = !unlockedVotes.maxLockedBlock.isZero()
        ? durationInDaysAndHoursFromNow(
            lockedSeconds?.times(1000).toNumber() ?? 0,
          )
        : undefined

      return { unlockedValue, endDate }
    }

    return { unlockedValue: "0", endDate: undefined }
  }, [unlockedVotes, lockDemocracy, native, slotDurationMs])

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
        ).times(BigNumber(slotDurationMs).div(1000))

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
  }, [openGovUnlockedVotes, lockOpenGov, native, slotDurationMs])

  const commonUnlockedValue =
    unlockedVotes?.maxLockedValue.gt(openGovUnlockValue) ||
    BigNumber(openGovUnlockedVotes?.maxLockedValue ?? "0").gt(unlockedValue)
      ? BigNumber.min(unlockedValue, openGovUnlockValue)
      : BigNumber.max(unlockedValue, openGovUnlockValue)

  return {
    isLoading:
      isLoadingVotes || isLoadingPrice || isLoadingOpenGov || isLoading,
    ids: unlockedVotes?.ids ?? [],
    openGovIds: openGovUnlockedVotes?.ids ?? [],
    unlockedValue: commonUnlockedValue.toString(),
    unlockedDisplayValue: BigNumber(commonUnlockedValue)
      .times(getAssetPrice(native.id).price)
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
  const { createBatch } = useCreateBatchTx()

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

    if (txs.length || openGovTxs.length) {
      const batchTxs = [
        ...txs,
        ...openGovTxs,
        api.tx.democracy.unlock(account.address),
        ...opneGovUnlock.map((classId) =>
          api.tx.convictionVoting.unlock(classId, account.address),
        ),
      ]

      return await createBatch(
        batchTxs,
        {},
        {
          toast,
          onSuccess: () => {
            queryClient.invalidateQueries(
              QUERY_KEYS.lock(account?.address, native.id),
            )
          },
        },
      )
    }

    return await createTransaction(
      {
        tx: api.tx.democracy.unlock(account.address),
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

export const useAccountAssets = (address?: string) => {
  const { account } = useAccount()
  const followedAddress = address ?? account?.address

  const { data: accountAssets, isLoading: isBalancesLoading } =
    useAccountBalances(followedAddress)

  const { balances } = accountAssets ?? {}

  const { tokensWithBalance, validTokensIdsWithBalance } = useMemo(() => {
    if (balances?.length) {
      const tokensWithBalance: AccountBalance[] = []
      const validTokensIdsWithBalance: string[] = []

      for (const accountBalance of balances) {
        const { asset } = accountBalance

        if (asset && asset.symbol && asset.isTradable && !asset.isBond) {
          tokensWithBalance.push(accountBalance)
          validTokensIdsWithBalance.push(asset.id)
        }
      }

      return { tokensWithBalance, validTokensIdsWithBalance }
    }

    return { tokensWithBalance: [], validTokensIdsWithBalance: [] }
  }, [balances])

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(
    validTokensIdsWithBalance,
  )

  const data = useMemo(() => {
    if (isBalancesLoading || isPriceLoading) return []

    return tokensWithBalance.map((accountBalance) => {
      const { balance, asset } = accountBalance

      const { decimals, id } = asset
      const spotPrice = getAssetPrice(id).price

      const total = BigNumber(balance.total).shiftedBy(-decimals)
      const totalDisplay =
        spotPrice && BigNumber(spotPrice).isFinite()
          ? total.times(spotPrice).toString()
          : undefined

      return {
        id,
        totalDisplay,
      }
    })
  }, [getAssetPrice, isBalancesLoading, isPriceLoading, tokensWithBalance])

  return { data, isLoading: isBalancesLoading || isPriceLoading }
}
