import {
  getAssetIdFromAddress,
  isH160Address,
  safeConvertH160toSS58,
} from "@galacticcouncil/utils"
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

export type TreasuryAssetBreakdownPart = {
  balance: string
  valueUsd: string | null
}

export type TreasuryAssetBreakdown = {
  wallet?: TreasuryAssetBreakdownPart
  moneyMarketSupply?: TreasuryAssetBreakdownPart
  moneyMarketBorrow?: TreasuryAssetBreakdownPart
}

type TreasuryAccount = {
  address: string
  label: string
  includeWalletBalances?: boolean
}

export type TreasuryAssetBalance = {
  asset: TAsset
  balance: string
  balanceRaw: string
  price: string | null
  valueUsd: string | null
  share: number
  source: TreasuryAssetSource
  breakdown: TreasuryAssetBreakdown
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

const TREASURY_STATS_ACCOUNTS = [
  {
    address: "13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB",
    label: "Hydration treasury",
    includeWalletBalances: true,
  },
  {
    address: "0x8C0f3b9602374198974d2B2679d14a386f5b108e",
    label: "HOLLAR collector treasury",
    includeWalletBalances: true,
  },
  {
    address: "0xE52567fF06aCd6CBe7BA94dc777a3126e180B6d9",
    label: "Money market treasury",
    includeWalletBalances: true,
  },
] satisfies TreasuryAccount[]

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

const getBalanceAccountAddress = (address: string) =>
  isH160Address(address) ? safeConvertH160toSS58(address) : address

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
  accounts: TreasuryAccount[] = TREASURY_STATS_ACCOUNTS,
) => {
  const { isApiLoaded, sdk } = rpc
  const displayAssetId = ENV.VITE_DISPLAY_ASSET_ID
  const assetIds = assets.map((asset) => asset.id).join(",")
  const accountAddresses = accounts.map((account) => account.address).join(",")

  return queryOptions({
    queryKey: ["stats", "treasury", accountAddresses, displayAssetId, assetIds],
    queryFn: async (): Promise<TreasuryStatsData> => {
      const walletAccounts = accounts.filter(
        (account) => account.includeWalletBalances,
      )
      const balances = await Promise.all(
        walletAccounts.flatMap((account) => {
          const address = getBalanceAccountAddress(account.address)

          if (!address) return []

          return assets.map(async (asset) => {
            const balanceRaw = await getAssetBalance(rpc, address, asset)
            const balance = scaleHuman(balanceRaw, asset.decimals)

            return {
              asset,
              balance,
              balanceRaw: balanceRaw.toString(),
            }
          })
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
            breakdown: {
              wallet: {
                balance,
                valueUsd,
              },
            },
          }
        }),
      )

      const totalValueUsd = pricedAssets.reduce(
        (acc, item) => (item.valueUsd ? acc.plus(item.valueUsd) : acc),
        new Big(0),
      )

      return {
        address: accountAddresses,
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
    enabled: isApiLoaded && accountAddresses.length > 0 && assets.length > 0,
  })
}

const mergeBreakdownPart = (
  first?: TreasuryAssetBreakdownPart,
  second?: TreasuryAssetBreakdownPart,
): TreasuryAssetBreakdownPart | undefined => {
  if (!first) return second
  if (!second) return first

  return {
    balance: sumBigStrings(first.balance, second.balance).toString(),
    valueUsd: sumBigStrings(first.valueUsd, second.valueUsd).toString(),
  }
}

const mergeAssetBreakdowns = (
  first: TreasuryAssetBreakdown,
  second: TreasuryAssetBreakdown,
): TreasuryAssetBreakdown => ({
  wallet: mergeBreakdownPart(first.wallet, second.wallet),
  moneyMarketSupply: mergeBreakdownPart(
    first.moneyMarketSupply,
    second.moneyMarketSupply,
  ),
  moneyMarketBorrow: mergeBreakdownPart(
    first.moneyMarketBorrow,
    second.moneyMarketBorrow,
  ),
})

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
    const breakdown = mergeAssetBreakdowns(existing.breakdown, item.breakdown)

    positionMap.set(item.asset.id, {
      ...existing,
      balance,
      balanceRaw: balance,
      valueUsd,
      price: getPositionPrice(balance, valueUsd),
      breakdown,
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
  const { data: hydrationBorrowSummary, isLoading: isHydrationBorrowLoading } =
    useUserBorrowSummary(TREASURY_STATS_ACCOUNTS[0]!.address)
  const { data: hollarBorrowSummary, isLoading: isHollarBorrowLoading } =
    useUserBorrowSummary(TREASURY_STATS_ACCOUNTS[1]!.address)
  const {
    data: moneyMarketBorrowSummary,
    isLoading: isMoneyMarketBorrowLoading,
  } = useUserBorrowSummary(TREASURY_STATS_ACCOUNTS[2]!.address)

  const data = useMemo(() => {
    if (!treasury.data) return undefined

    const assetMap = new Map(assets.map((asset) => [asset.id, asset]))
    const directWalletAssets = treasury.data.assets.filter(
      (item) => !isReceiptToken(item.asset),
    )
    const borrowSummaries = [
      hydrationBorrowSummary,
      hollarBorrowSummary,
      moneyMarketBorrowSummary,
    ]

    const supplyAssets = borrowSummaries.flatMap(
      (summary) =>
        summary?.userReservesData
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
              breakdown: {
                moneyMarketSupply: {
                  balance: position.underlyingBalance,
                  valueUsd: position.underlyingBalanceUSD,
                },
              },
            }
          })
          .filter((item): item is TreasuryAssetBalance => !!item) ?? [],
    )

    const borrowPositions = borrowSummaries.flatMap(
      (summary) =>
        summary?.userReservesData
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
              breakdown: {
                moneyMarketBorrow: {
                  balance,
                  valueUsd,
                },
              },
            }
          })
          .filter((item): item is TreasuryAssetBalance => !!item) ?? [],
    )

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
      borrowPositions: withCompositionShares(
        mergePositivePositions([], borrowPositions),
        borrowValueUsd,
      ),
    }
  }, [
    assets,
    hollarBorrowSummary,
    hydrationBorrowSummary,
    moneyMarketBorrowSummary,
    treasury.data,
  ])

  return {
    ...treasury,
    data,
    isLoading:
      treasury.isLoading ||
      isHydrationBorrowLoading ||
      isHollarBorrowLoading ||
      isMoneyMarketBorrowLoading,
  }
}
