import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { AssetType } from "@/api/assets"
import { useUserBorrowSummary } from "@/api/borrow"
import { getSpotPrice } from "@/api/spotPrice"
import { ENV } from "@/config/env"
import { TAsset } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

export type TreasuryAssetSource =
  | "wallet"
  | "moneyMarketSupply"
  | "moneyMarketBorrow"
  | "mixed"

export type TreasuryAssetBalance = {
  asset: TAsset
  balance: string
  balanceRaw: string
  price: string | null
  valueUsd: string | null
  share: number
  source: TreasuryAssetSource
}

export type TreasuryStatsData = {
  address: string
  totalValueUsd: string
  holdingsValueUsd: string
  borrowValueUsd: string
  pricedAssetCount: number
  assets: TreasuryAssetBalance[]
  borrowPositions: TreasuryAssetBalance[]
}

const TREASURY_STATS_ADDRESS =
  "13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB"

const isPositive = (value: string) => {
  try {
    return new Big(value).gt(0)
  } catch {
    return false
  }
}

const isReceiptToken = (asset: TAsset) =>
  asset.type === AssetType.ERC20 &&
  "underlyingAssetId" in asset &&
  !!asset.underlyingAssetId

const sumBigStrings = (...values: Array<string | null | undefined>) =>
  values.reduce((acc, value) => {
    if (!value) return acc

    try {
      return acc.plus(value)
    } catch {
      return acc
    }
  }, new Big(0))

const getPositionPrice = (balance: string, valueUsd: string) => {
  try {
    const balanceValue = new Big(balance)

    return balanceValue.gt(0)
      ? new Big(valueUsd).div(balanceValue).toString()
      : null
  } catch {
    return null
  }
}

const getAssetBalance = async (
  { papi }: TProviderContext,
  address: string,
  asset: TAsset,
) => {
  if (asset.id === NATIVE_ASSET_ID) {
    const {
      data: { free, reserved },
    } = await papi.query.System.Account.getValue(address)

    return free + reserved
  }

  const { free, reserved } = await papi.query.Tokens.Accounts.getValue(
    address,
    Number(asset.id),
  )

  return free + reserved
}

export const treasuryStatsQuery = (
  rpc: TProviderContext,
  assets: TAsset[],
  address = TREASURY_STATS_ADDRESS,
) => {
  const { isApiLoaded, sdk } = rpc
  const displayAssetId = ENV.VITE_DISPLAY_ASSET_ID
  const assetIds = assets.map((asset) => asset.id).join(",")

  return queryOptions({
    queryKey: ["stats", "treasury", address, displayAssetId, assetIds],
    queryFn: async (): Promise<TreasuryStatsData> => {
      const balances = await Promise.all(
        assets.map(async (asset) => {
          const balanceRaw = await getAssetBalance(rpc, address, asset)
          const balance = scaleHuman(balanceRaw, asset.decimals)

          return {
            asset,
            balance,
            balanceRaw: balanceRaw.toString(),
          }
        }),
      )

      const nonZeroBalances = balances.filter(({ balance }) =>
        isPositive(balance),
      )

      const pricedAssets = await Promise.all(
        nonZeroBalances.map(async ({ asset, balance, balanceRaw }) => {
          const { spotPrice } = await getSpotPrice(
            sdk.api.router,
            asset.id,
            displayAssetId,
          )()

          const valueUsd = spotPrice
            ? new Big(balance).times(spotPrice).toString()
            : null

          return {
            asset,
            balance,
            balanceRaw,
            price: spotPrice,
            valueUsd,
            share: 0,
            source: "wallet" as const,
          }
        }),
      )

      const totalValueUsd = pricedAssets.reduce(
        (acc, item) => (item.valueUsd ? acc.plus(item.valueUsd) : acc),
        new Big(0),
      )

      return {
        address,
        totalValueUsd: totalValueUsd.toString(),
        holdingsValueUsd: totalValueUsd.toString(),
        borrowValueUsd: "0",
        pricedAssetCount: pricedAssets.filter((item) => item.valueUsd).length,
        assets: pricedAssets
          .map((item) => ({
            ...item,
            share:
              item.valueUsd && totalValueUsd.gt(0)
                ? new Big(item.valueUsd)
                    .div(totalValueUsd)
                    .times(100)
                    .toNumber()
                : 0,
          }))
          .sort((a, b) => {
            const valueA = a.valueUsd ? Number(a.valueUsd) : 0
            const valueB = b.valueUsd ? Number(b.valueUsd) : 0

            return valueB - valueA
          }),
        borrowPositions: [],
      }
    },
    enabled: isApiLoaded && !!address && assets.length > 0,
  })
}

const mergePositivePositions = (
  walletAssets: TreasuryAssetBalance[],
  supplyAssets: TreasuryAssetBalance[],
) => {
  const positionMap = new Map<string, TreasuryAssetBalance>()

  for (const item of [...walletAssets, ...supplyAssets]) {
    const existing = positionMap.get(item.asset.id)

    if (!existing) {
      positionMap.set(item.asset.id, item)
      continue
    }

    const balance = sumBigStrings(existing.balance, item.balance).toString()
    const valueUsd = sumBigStrings(existing.valueUsd, item.valueUsd).toString()

    positionMap.set(item.asset.id, {
      ...existing,
      balance,
      balanceRaw: balance,
      valueUsd,
      price: getPositionPrice(balance, valueUsd),
      source:
        existing.source === item.source ? existing.source : ("mixed" as const),
    })
  }

  return Array.from(positionMap.values())
}

const withCompositionShares = (
  assets: TreasuryAssetBalance[],
  totalValueUsd: Big,
) =>
  assets
    .map((item) => ({
      ...item,
      share:
        item.valueUsd && totalValueUsd.gt(0)
          ? new Big(item.valueUsd).div(totalValueUsd).times(100).toNumber()
          : 0,
    }))
    .sort((a, b) => {
      const valueA = a.valueUsd ? Number(a.valueUsd) : 0
      const valueB = b.valueUsd ? Number(b.valueUsd) : 0

      return valueB - valueA
    })

export const useTreasuryStats = (assets: TAsset[]) => {
  const treasury = useQuery(treasuryStatsQuery(useRpcProvider(), assets))
  const { data: borrowSummary, isLoading: isBorrowLoading } =
    useUserBorrowSummary(TREASURY_STATS_ADDRESS)

  const data = useMemo(() => {
    if (!treasury.data) return undefined

    const assetMap = new Map(assets.map((asset) => [asset.id, asset]))
    const directWalletAssets = treasury.data.assets.filter(
      (item) => !isReceiptToken(item.asset),
    )

    const supplyAssets =
      borrowSummary?.userReservesData
        ?.filter((position) => isPositive(position.underlyingBalanceUSD))
        .map((position): TreasuryAssetBalance | undefined => {
          const assetId = getAssetIdFromAddress(
            position.reserve.underlyingAsset,
          )
          const asset = assetMap.get(assetId)

          if (!asset) return undefined

          return {
            asset,
            balance: position.underlyingBalance,
            balanceRaw: position.underlyingBalance,
            price: getPositionPrice(
              position.underlyingBalance,
              position.underlyingBalanceUSD,
            ),
            valueUsd: position.underlyingBalanceUSD,
            share: 0,
            source: "moneyMarketSupply",
          }
        })
        .filter((item): item is TreasuryAssetBalance => !!item) ?? []

    const borrowPositions =
      borrowSummary?.userReservesData
        ?.map((position): TreasuryAssetBalance | undefined => {
          const assetId = getAssetIdFromAddress(
            position.reserve.underlyingAsset,
          )
          const asset = assetMap.get(assetId)

          if (!asset) return undefined

          const balance = sumBigStrings(
            position.variableBorrows,
            position.stableBorrows,
          ).toString()
          const valueUsd = sumBigStrings(
            position.variableBorrowsUSD,
            position.stableBorrowsUSD,
          ).toString()

          if (!isPositive(valueUsd)) return undefined

          return {
            asset,
            balance,
            balanceRaw: balance,
            price: getPositionPrice(balance, valueUsd),
            valueUsd,
            share: 0,
            source: "moneyMarketBorrow",
          }
        })
        .filter((item): item is TreasuryAssetBalance => !!item) ?? []

    const positiveAssets = mergePositivePositions(
      directWalletAssets,
      supplyAssets,
    )
    const holdingsValueUsd = positiveAssets.reduce(
      (acc, item) => (item.valueUsd ? acc.plus(item.valueUsd) : acc),
      new Big(0),
    )
    const borrowValueUsd = borrowPositions.reduce(
      (acc, item) => (item.valueUsd ? acc.plus(item.valueUsd) : acc),
      new Big(0),
    )

    return {
      ...treasury.data,
      totalValueUsd: holdingsValueUsd.minus(borrowValueUsd).toString(),
      holdingsValueUsd: holdingsValueUsd.toString(),
      borrowValueUsd: borrowValueUsd.toString(),
      pricedAssetCount: positiveAssets.filter((item) => item.valueUsd).length,
      assets: withCompositionShares(positiveAssets, holdingsValueUsd),
      borrowPositions: borrowPositions.sort((a, b) => {
        const valueA = a.valueUsd ? Number(a.valueUsd) : 0
        const valueB = b.valueUsd ? Number(b.valueUsd) : 0

        return valueB - valueA
      }),
    }
  }, [assets, borrowSummary?.userReservesData, treasury.data])

  return {
    ...treasury,
    data,
    isLoading: treasury.isLoading || isBorrowLoading,
  }
}
