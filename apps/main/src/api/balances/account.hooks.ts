import { useStableArray } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { unique } from "remeda"

import { AssetType, TBond, TErc20, TStableswap, TToken } from "@/api/assets"
import {
  accountBalancesQuery,
  maxWithdrawAllQuery,
  useAccountBalanceFilter,
} from "@/api/balances/account.queries"
import {
  Erc20BalanceSnapshot,
  syncErc20BalanceSnapshot,
  withMaxWithdraw,
} from "@/api/balances/account.utils"
import { Balance, BalanceRecord, EMPTY_BALANCES } from "@/api/balances/types"
import { AssetId, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"

export const useAccountBalances = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { getErc20AToken } = useAssets()
  const address = account?.address ?? ""
  const balanceFilter = useAccountBalanceFilter()

  const { data, isPending: isBalancesPending } = useQuery(
    accountBalancesQuery(rpc, address, balanceFilter),
  )
  const {
    data: maxWithdrawAll,
    isPending: isMaxWithdrawAllPending,
    isFetching: isMaxWithdrawAllFetching,
  } = useQuery(maxWithdrawAllQuery(rpc, address))

  useErc20MaxWithdrawSync(address, data)

  const balances = useMemo(() => {
    if (!data || (!maxWithdrawAll && isMaxWithdrawAllPending)) {
      return EMPTY_BALANCES
    }

    return Object.fromEntries(
      Object.entries(data).map(([assetId, balance]) => [
        assetId,
        withMaxWithdraw(
          balance,
          getErc20AToken(assetId)?.underlyingAssetId,
          maxWithdrawAll ?? {},
          isMaxWithdrawAllFetching,
        ),
      ]),
    )
  }, [
    data,
    maxWithdrawAll,
    isMaxWithdrawAllPending,
    isMaxWithdrawAllFetching,
    getErc20AToken,
  ])

  const getBalance = useCallback(
    (assetId: AssetId) => balances[assetId.toString()],
    [balances],
  )

  const getTransferableBalance = useCallback(
    (assetId: string) => balances[assetId]?.transferable ?? 0n,
    [balances],
  )

  const isBalanceLoaded = useCallback(
    (assetId: string) => assetId in balances,
    [balances],
  )

  const isBalanceLoading = account
    ? isBalancesPending || isMaxWithdrawAllPending || !balanceFilter
    : false

  return {
    balances,
    isBalanceLoading,
    isBalanceLoaded,
    getBalance,
    getTransferableBalance,
  }
}

export const useAccountBalance = (assetId: AssetId): Balance | undefined => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const { getErc20AToken } = useAssets()
  const address = account?.address ?? ""
  const id = assetId.toString()
  const balanceFilter = useAccountBalanceFilter()

  const { data } = useQuery({
    ...accountBalancesQuery(rpc, address, balanceFilter),
    select: (balances) => balances[id],
  })
  const {
    data: maxWithdrawAll,
    isPending: isMaxWithdrawAllPending,
    isFetching: isMaxWithdrawAllFetching,
  } = useQuery(maxWithdrawAllQuery(rpc, address))

  if (!data || (!maxWithdrawAll && isMaxWithdrawAllPending)) return undefined

  return withMaxWithdraw(
    data,
    getErc20AToken(id)?.underlyingAssetId,
    maxWithdrawAll ?? {},
    isMaxWithdrawAllFetching,
  )
}

export const useAccountBalancesWithPriceByAssetType = (
  assetTypes: Array<
    Exclude<AssetType, AssetType.External | AssetType.Unknown | AssetType.XYK>
  >,
) => {
  const stableAssetTypes = useStableArray(assetTypes)
  const { getAsset, isToken, isStableSwap, isErc20, isBond } = useAssets()
  const { balances, isBalanceLoading } = useAccountBalances()

  const {
    tokenBalances,
    erc20Balances,
    stableSwapBalances,
    bondBalances,
    priceIds,
  } = useMemo(() => {
    const tokenBalances: Array<{ balance: Balance; meta: TToken }> = []
    const erc20Balances: Array<{ balance: Balance; meta: TErc20 }> = []
    const stableSwapBalances: Array<{ balance: Balance; meta: TStableswap }> =
      []
    const bondBalances: Array<{ balance: Balance; meta: TBond }> = []
    const priceIds: Array<string> = []

    for (const balance of Object.values(balances)) {
      const asset = getAsset(balance.assetId)
      if (!asset) continue

      const isTokenType = isToken(asset)
      const isErc20Type = isErc20(asset)
      const isStableSwapType = isStableSwap(asset)
      const isBondType = isBond(asset)

      const isSupportedType =
        isTokenType || isErc20Type || isStableSwapType || isBondType
      const isValidType = isSupportedType
        ? stableAssetTypes.includes(asset.type)
        : false

      if (!isValidType) continue

      priceIds.push(isBondType ? asset.underlyingAssetId : balance.assetId)

      if (isTokenType) {
        tokenBalances.push({
          balance: balance,
          meta: asset,
        })
      } else if (isStableSwapType) {
        stableSwapBalances.push({
          balance: balance,
          meta: asset,
        })
      } else if (isErc20Type) {
        erc20Balances.push({
          balance: balance,
          meta: asset,
        })
      } else if (isBondType) {
        bondBalances.push({
          balance: balance,
          meta: asset,
        })
      }
    }

    return {
      tokenBalances,
      erc20Balances,
      stableSwapBalances,
      bondBalances,
      priceIds: unique(priceIds),
    }
  }, [
    balances,
    getAsset,
    isToken,
    isErc20,
    isStableSwap,
    isBond,
    stableAssetTypes,
  ])

  const { getAssetPrice, isLoading: isAssetPriceLoading } =
    useAssetsPrice(priceIds)

  const mapBalancesWithPrice = useCallback(
    <T extends { meta: { id: string } }>(
      balances: T[],
      getPriceAssetId: (meta: T["meta"]) => string = (meta) => meta.id,
    ): Array<T & { price: string | undefined }> => {
      return balances.map((balance) => {
        const assetPrice = getAssetPrice(getPriceAssetId(balance.meta))
        return {
          ...balance,
          price: assetPrice.isValid ? assetPrice.price : undefined,
        }
      })
    },
    [getAssetPrice],
  )

  const data = useMemo(
    () => ({
      tokenBalances: mapBalancesWithPrice(tokenBalances),
      erc20Balances: mapBalancesWithPrice(erc20Balances),
      stableSwapBalances: mapBalancesWithPrice(stableSwapBalances),
      bondBalances: mapBalancesWithPrice(
        bondBalances,
        (meta) => (meta as TBond).underlyingAssetId,
      ),
    }),
    [
      bondBalances,
      erc20Balances,
      mapBalancesWithPrice,
      stableSwapBalances,
      tokenBalances,
    ],
  )

  const hasBalances =
    tokenBalances.length > 0 ||
    erc20Balances.length > 0 ||
    stableSwapBalances.length > 0 ||
    bondBalances.length > 0

  return {
    data,
    isLoading: (isBalanceLoading || isAssetPriceLoading) && !hasBalances,
    isSettled: !isBalanceLoading && !isAssetPriceLoading,
  }
}

/**
 * Invalidates the max withdraw query whenever an erc20 aToken balance changes significantly
 */
const useErc20MaxWithdrawSync = (
  address: string,
  balances: BalanceRecord | undefined,
) => {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  const { getErc20AToken } = useAssets()
  const snapshotRef = useRef<Erc20BalanceSnapshot>(new Map())

  useEffect(() => {
    snapshotRef.current.clear()
  }, [address])

  useEffect(() => {
    if (!balances) return

    const shouldSync = syncErc20BalanceSnapshot(
      snapshotRef.current,
      balances,
      (assetId) => !!getErc20AToken(assetId),
    )

    if (shouldSync) {
      void queryClient.fetchQuery(maxWithdrawAllQuery(rpc, address))
    }
  }, [address, balances, getErc20AToken, queryClient, rpc])
}
