import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import {
  getAssetIdFromAddress,
  isH160Address,
  safeConvertH160toSS58,
} from "@galacticcouncil/utils"
import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import {
  OmnipoolDepositFull,
  OmnipoolPosition,
  XykDeposit,
} from "@/api/account"
import { AssetType } from "@/api/assets"
import { useUserBorrowSummary } from "@/api/borrow"
import { OmniPoolToken, PoolToken, PoolType } from "@/api/pools"
import { getSpotPrice } from "@/api/spotPrice"
import { ENV } from "@/config/env"
import { isBond, TAsset } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { HUB_ID, NATIVE_ASSET_ID } from "@/utils/consts"
import { scale, scaleHuman } from "@/utils/formatting"
import {
  getOmnipoolMiningPositions,
  getOmnipoolPositions,
  getXykMiningPositions,
} from "@/utils/uniques"

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
  liquidity?: TreasuryAssetBreakdownPart
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

const isStableSwapAsset = (asset: TAsset) => asset.type === AssetType.STABLESWAP

const isXYKShareAsset = (
  asset: TAsset,
): asset is TAsset & {
  poolAddress: string
  assets: [TAsset, TAsset]
} =>
  "poolAddress" in asset &&
  typeof asset.poolAddress === "string" &&
  "assets" in asset &&
  Array.isArray(asset.assets)

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

const getAssetValueUsd = async (
  { sdk }: TProviderContext,
  assetId: string,
  balance: string,
  displayAssetId: string,
) => {
  const { spotPrice } = await getSpotPrice(
    sdk.api.router,
    assetId,
    displayAssetId,
  )()

  return {
    price: spotPrice,
    valueUsd: spotPrice ? new Big(balance).times(spotPrice).toString() : null,
  }
}

const getTreasuryPricingAssetId = (asset: TAsset) =>
  isBond(asset) ? asset.underlyingAssetId : asset.id

const createWalletAssetBalance = async (
  rpc: TProviderContext,
  asset: TAsset,
  balance: string,
  balanceRaw: string,
  displayAssetId: string,
): Promise<TreasuryAssetBalance> => {
  const { price, valueUsd } = await getAssetValueUsd(
    rpc,
    getTreasuryPricingAssetId(asset),
    balance,
    displayAssetId,
  )

  return {
    asset,
    balance,
    balanceRaw,
    price,
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
}

const createLiquidityAssetBalance = async (
  rpc: TProviderContext,
  asset: TAsset,
  balanceRaw: string,
  displayAssetId: string,
): Promise<TreasuryAssetBalance> => {
  const balance = scaleHuman(balanceRaw, asset.decimals)
  const { price, valueUsd } = await getAssetValueUsd(
    rpc,
    getTreasuryPricingAssetId(asset),
    balance,
    displayAssetId,
  )

  return {
    asset,
    balance,
    balanceRaw,
    price,
    valueUsd,
    share: 0,
    source: "wallet" as const,
    breakdown: {
      liquidity: {
        balance,
        valueUsd,
      },
    },
  }
}

const getPoolTokenBalance = (poolToken: PoolToken, shares: string) =>
  Big(poolToken.balance.toString()).times(shares)

type TreasuryPool = Awaited<
  ReturnType<TProviderContext["sdk"]["api"]["router"]["getPools"]>
>[number]

type TreasuryOmnipoolPosition = OmnipoolPosition | OmnipoolDepositFull

const getOmnipoolPositionLiquidity = (
  omnipoolData: OmniPoolToken,
  position: TreasuryOmnipoolPosition,
) => {
  const [nom, denom] = position.price.map((value) => value.toString()) as [
    string,
    string,
  ]
  const positionPrice = Big(nom).div(denom).toString()
  const params = [
    omnipoolData.balance.toString(),
    omnipoolData.hubReserves.toString(),
    omnipoolData.shares.toString(),
    position.amount.toString(),
    position.shares.toString(),
    Big(scale(positionPrice, "q")).toFixed(0),
    position.shares.toString(),
    "0",
  ] as Parameters<typeof calculate_liquidity_out>

  return {
    liquidity: calculate_liquidity_out(...params),
    hubLiquidity: calculate_liquidity_lrna_out(...params),
  }
}

const getTreasuryOmnipoolPositions = async (
  rpc: TProviderContext,
  address: string,
) => {
  const [omnipoolNftId, miningNftId] = await Promise.all([
    rpc.papi.constants.Omnipool.NFTCollectionId(),
    rpc.papi.constants.OmnipoolLiquidityMining.NFTCollectionId(),
  ])

  const [omnipoolEntries, miningEntries] = await Promise.all([
    rpc.papi.query.Uniques.Account.getEntries(address, omnipoolNftId, {
      at: "best",
    }),
    rpc.papi.query.Uniques.Account.getEntries(address, miningNftId, {
      at: "best",
    }),
  ])

  const [omnipoolPositions, omnipoolMiningPositions] = await Promise.all([
    omnipoolEntries.length
      ? getOmnipoolPositions(rpc.papi, omnipoolEntries)
      : [],
    miningEntries.length
      ? getOmnipoolMiningPositions(rpc.papi, miningEntries)
      : [],
  ])

  return Array.from(
    new Map(
      [...omnipoolPositions, ...omnipoolMiningPositions].map((position) => [
        position.positionId,
        position,
      ]),
    ).values(),
  )
}

const getTreasuryXykMiningPositions = async (
  rpc: TProviderContext,
  address: string,
) => {
  const xykMiningNftId =
    await rpc.papi.constants.XYKLiquidityMining.NFTCollectionId()
  const entries = await rpc.papi.query.Uniques.Account.getEntries(
    address,
    xykMiningNftId,
    { at: "best" },
  )

  return entries.length ? getXykMiningPositions(rpc.papi, entries) : []
}

const expandXYKShareToken = async (
  rpc: TProviderContext,
  pools: TreasuryPool[],
  asset: TAsset,
  balanceRaw: string,
  displayAssetId: string,
): Promise<TreasuryAssetBalance[]> => {
  if (!isXYKShareAsset(asset)) return []

  const pool = pools.find((pool) => pool.address === asset.poolAddress)
  const totalLiquidity = await rpc.papi.query.XYK.TotalLiquidity.getValue(
    asset.poolAddress,
  )

  if (!pool || !totalLiquidity || Big(totalLiquidity.toString()).lte(0)) {
    return []
  }

  const shareRatio = Big(balanceRaw).div(totalLiquidity.toString())
  const poolTokens = pool.tokens.filter((token) =>
    asset.assets.some((asset) => asset.id === token.id.toString()),
  )

  return Promise.all(
    poolTokens.map((token) => {
      const tokenAsset = asset.assets.find(
        (asset) => asset.id === token.id.toString(),
      )

      if (!tokenAsset) return undefined

      return createLiquidityAssetBalance(
        rpc,
        tokenAsset,
        getPoolTokenBalance(token, shareRatio.toString()).toString(),
        displayAssetId,
      )
    }),
  ).then((items) =>
    items.filter((item): item is TreasuryAssetBalance => !!item),
  )
}

const expandXYKMiningPosition = async (
  rpc: TProviderContext,
  pools: TreasuryPool[],
  shareAssetsByPoolAddress: Map<string, TAsset & { poolAddress: string }>,
  position: XykDeposit,
  displayAssetId: string,
): Promise<TreasuryAssetBalance[]> => {
  const asset = shareAssetsByPoolAddress.get(position.amm_pool_id)

  if (!asset) return []

  return expandXYKShareToken(
    rpc,
    pools,
    asset,
    position.shares.toString(),
    displayAssetId,
  )
}

const expandStableSwapAsset = async (
  rpc: TProviderContext,
  pools: TreasuryPool[],
  asset: TAsset,
  assetMap: Map<string, TAsset>,
  balanceRaw: string,
  displayAssetId: string,
): Promise<TreasuryAssetBalance[]> => {
  if (!isStableSwapAsset(asset)) return []

  const pool = pools.find((pool) => pool.id?.toString() === asset.id)
  const totalIssuance = await rpc.papi.query.Tokens.TotalIssuance.getValue(
    Number(asset.id),
  )

  if (!pool || !totalIssuance || Big(totalIssuance.toString()).lte(0)) {
    return []
  }

  const shareRatio = Big(balanceRaw).div(totalIssuance.toString())

  return Promise.all(
    pool.tokens
      .filter((token) => token.id.toString() !== asset.id)
      .map((token) => {
        const tokenAsset = assetMap.get(token.id.toString())

        if (!tokenAsset) return undefined

        return createLiquidityAssetBalance(
          rpc,
          tokenAsset,
          getPoolTokenBalance(token, shareRatio.toString()).toString(),
          displayAssetId,
        )
      }),
  ).then((items) =>
    items.filter((item): item is TreasuryAssetBalance => !!item),
  )
}

const expandOmnipoolPosition = async (
  rpc: TProviderContext,
  omnipoolTokens: OmniPoolToken[],
  assetMap: Map<string, TAsset>,
  position: TreasuryOmnipoolPosition,
  displayAssetId: string,
): Promise<TreasuryAssetBalance | undefined> => {
  const asset = assetMap.get(position.assetId)
  const omnipoolData = omnipoolTokens.find(
    (token) => token.id.toString() === position.assetId,
  )

  if (!asset || !omnipoolData) return undefined

  const { liquidity, hubLiquidity } = getOmnipoolPositionLiquidity(
    omnipoolData,
    position,
  )
  const balance = scaleHuman(liquidity, asset.decimals)
  const { price, valueUsd } = await getAssetValueUsd(
    rpc,
    asset.id,
    balance,
    displayAssetId,
  )
  const hubAsset = assetMap.get(HUB_ID)
  const hubValueUsd =
    hubAsset && Big(hubLiquidity).gt(0)
      ? (
          await getAssetValueUsd(
            rpc,
            hubAsset.id,
            scaleHuman(hubLiquidity, hubAsset.decimals),
            displayAssetId,
          )
        ).valueUsd
      : null
  const totalValueUsd = valueUsd
    ? sumBigStrings(valueUsd, hubValueUsd).toString()
    : null
  const totalBalance =
    price && totalValueUsd ? Big(totalValueUsd).div(price).toString() : balance

  return {
    asset,
    balance: totalBalance,
    balanceRaw: liquidity,
    price,
    valueUsd: totalValueUsd,
    share: 0,
    source: "wallet" as const,
    breakdown: {
      liquidity: {
        balance: totalBalance,
        valueUsd: totalValueUsd,
      },
    },
  }
}

export const treasuryStatsQuery = (
  rpc: TProviderContext,
  assets: TAsset[],
  accounts: TreasuryAccount[] = TREASURY_STATS_ACCOUNTS,
) => {
  const { isApiLoaded } = rpc
  const displayAssetId = ENV.VITE_DISPLAY_ASSET_ID
  const assetIds = assets.map((asset) => asset.id).join(",")
  const accountAddresses = accounts.map((account) => account.address).join(",")

  return queryOptions({
    queryKey: ["stats", "treasury", accountAddresses, displayAssetId, assetIds],
    queryFn: async (): Promise<TreasuryStatsData> => {
      const walletAccounts = accounts.filter(
        (account) => account.includeWalletBalances,
      )
      const assetMap = new Map(assets.map((asset) => [asset.id, asset]))
      const shareAssetsByPoolAddress = new Map(
        assets
          .filter(isXYKShareAsset)
          .map((asset) => [asset.poolAddress, asset]),
      )
      const pools = await rpc.sdk.api.router.getPools()
      const omnipoolTokens = pools.flatMap((pool) =>
        pool.type === PoolType.Omni ? (pool.tokens as OmniPoolToken[]) : [],
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

      const walletAssets = await Promise.all(
        nonZeroBalances.map(async ({ asset, balance, balanceRaw }) => {
          if (isXYKShareAsset(asset)) {
            const liquidityAssets = await expandXYKShareToken(
              rpc,
              pools,
              asset,
              balanceRaw,
              displayAssetId,
            )

            if (liquidityAssets.length) return liquidityAssets
          }

          if (isStableSwapAsset(asset)) {
            const liquidityAssets = await expandStableSwapAsset(
              rpc,
              pools,
              asset,
              assetMap,
              balanceRaw,
              displayAssetId,
            )

            if (liquidityAssets.length) return liquidityAssets
          }

          return createWalletAssetBalance(
            rpc,
            asset,
            balance,
            balanceRaw,
            displayAssetId,
          )
        }),
      ).then((items) => items.flat())

      const omnipoolLiquidityAssets = await Promise.all(
        walletAccounts.flatMap((account) => {
          const address = getBalanceAccountAddress(account.address)

          if (!address) return []

          return getTreasuryOmnipoolPositions(rpc, address).then((positions) =>
            Promise.all(
              positions.map((position) =>
                expandOmnipoolPosition(
                  rpc,
                  omnipoolTokens,
                  assetMap,
                  position,
                  displayAssetId,
                ),
              ),
            ),
          )
        }),
      ).then((items) =>
        items.flat().filter((item): item is TreasuryAssetBalance => !!item),
      )

      const xykMiningLiquidityAssets = await Promise.all(
        walletAccounts.flatMap((account) => {
          const address = getBalanceAccountAddress(account.address)

          if (!address) return []

          return getTreasuryXykMiningPositions(rpc, address).then((positions) =>
            Promise.all(
              positions.map((position) =>
                expandXYKMiningPosition(
                  rpc,
                  pools,
                  shareAssetsByPoolAddress,
                  position,
                  displayAssetId,
                ),
              ),
            ),
          )
        }),
      ).then((items) => items.flat(2))

      const pricedAssets = mergePositivePositions(
        [],
        [
          ...walletAssets,
          ...omnipoolLiquidityAssets,
          ...xykMiningLiquidityAssets,
        ],
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
  liquidity: mergeBreakdownPart(first.liquidity, second.liquidity),
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
