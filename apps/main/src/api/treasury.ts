import { calculate_liquidity_out } from "@galacticcouncil/math-omnipool"
import {
  DOT_ASSET_ID,
  GDOT_ASSET_ID,
  getAssetIdFromAddress,
  GETH_ASSET_ID,
  GSOL_ASSET_ID,
  HEURC_ASSET_ID,
  HUSDC_ASSET_ID,
  HUSDE_ASSET_ID,
  HUSDS_ASSET_ID,
  HUSDT_ASSET_ID,
  isH160Address,
  safeConvertH160toSS58,
} from "@galacticcouncil/utils"
import { chainsMap, clients } from "@galacticcouncil/xc-cfg"
import type { Parachain } from "@galacticcouncil/xc-core"
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
import { NATIVE_ASSET_ID } from "@/utils/consts"
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

const TREASURY_ASSETHUB_DOT_ACCOUNTS = [
  {
    address: "13RSNAx31mcP5H5KYf12cP5YChq6JeD8Hi64twhhxKtHqBkg",
    label: "Polkadot Asset Hub staking address",
  },
  {
    address: "14kovW62mmGZBRvbNT1w5J7m9SQskd5JTRTLKZLpkpjmZBJ8",
    label: "Polkadot Asset Hub rewards address",
  },
] as const

const HOLLAR_POOL_LABELS_BY_ID = new Map<string, string>([
  [HUSDC_ASSET_ID, "HUSDC"],
  [HUSDT_ASSET_ID, "HUSDT"],
  [HUSDS_ASSET_ID, "HUSDS"],
  [HUSDE_ASSET_ID, "HUSDE"],
  [HEURC_ASSET_ID, "HEURC"],
  [GDOT_ASSET_ID, "GDOT"],
  [GETH_ASSET_ID, "GETH"],
  [GSOL_ASSET_ID, "GSOL"],
])

const normalizeTreasuryAsset = (asset: TAsset): TAsset => {
  const hollarPoolLabel = HOLLAR_POOL_LABELS_BY_ID.get(asset.id)

  return hollarPoolLabel
    ? {
        ...asset,
        symbol: hollarPoolLabel,
        name: hollarPoolLabel,
      }
    : asset
}

const isPositive = (value: string) => {
  try {
    return new Big(value).gt(0)
  } catch {
    return false
  }
}

const isReceiptToken = (
  asset: TAsset,
): asset is TAsset & { underlyingAssetId: string } =>
  asset.type === AssetType.ERC20 &&
  "underlyingAssetId" in asset &&
  !!asset.underlyingAssetId

const getReceiptTokenUnderlyingAssetId = (asset: TAsset) =>
  isReceiptToken(asset) && typeof asset.underlyingAssetId === "string"
    ? asset.underlyingAssetId
    : undefined

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

const getAssetHubDotBalance = async (address: string) => {
  try {
    const assetHub = chainsMap.get("assethub")

    if (!assetHub) return 0n

    const assetHubClient = new clients.AssethubClient(assetHub as Parachain)

    return assetHubClient.getSystemAccountBalance(address)
  } catch {
    return 0n
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
  isBond(asset)
    ? asset.underlyingAssetId
    : (getReceiptTokenUnderlyingAssetId(asset) ?? asset.id)

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
    asset: normalizeTreasuryAsset(asset),
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
    asset: normalizeTreasuryAsset(asset),
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

  return calculate_liquidity_out(...params)
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

  const liquidity = getOmnipoolPositionLiquidity(omnipoolData, position)
  const balance = scaleHuman(liquidity, asset.decimals)
  const { price, valueUsd } = await getAssetValueUsd(
    rpc,
    asset.id,
    balance,
    displayAssetId,
  )

  return {
    asset: normalizeTreasuryAsset(asset),
    balance,
    balanceRaw: liquidity,
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

export const treasuryStatsQuery = (
  rpc: TProviderContext,
  assets: TAsset[],
  accounts: TreasuryAccount[] = TREASURY_STATS_ACCOUNTS,
) => {
  const { isApiLoaded } = rpc
  const displayAssetId = ENV.VITE_DISPLAY_ASSET_ID
  const assetIds = assets.map((asset) => asset.id).join(",")
  const hydrationAccountAddresses = accounts
    .map((account) => account.address)
    .join(",")
  const assetHubDotAccountAddresses = TREASURY_ASSETHUB_DOT_ACCOUNTS.map(
    (account) => account.address,
  ).join(",")
  const accountAddresses = [
    hydrationAccountAddresses,
    assetHubDotAccountAddresses,
  ]
    .filter(Boolean)
    .join(",")

  return queryOptions({
    queryKey: ["stats", "treasury", accountAddresses, displayAssetId, assetIds],
    queryFn: async (): Promise<TreasuryStatsData> => {
      const walletAccounts = accounts.filter(
        (account) => account.includeWalletBalances,
      )
      const assetMap = new Map(assets.map((asset) => [asset.id, asset]))
      const dotAsset = assetMap.get(DOT_ASSET_ID)
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

      const assetHubDotAssets = dotAsset
        ? await Promise.all(
            TREASURY_ASSETHUB_DOT_ACCOUNTS.map(async (account) => {
              const balanceRaw = await getAssetHubDotBalance(account.address)
              const balance = scaleHuman(balanceRaw, dotAsset.decimals)

              if (!isPositive(balance)) return undefined

              return createWalletAssetBalance(
                rpc,
                dotAsset,
                balance,
                balanceRaw.toString(),
                displayAssetId,
              )
            }),
          ).then((items) =>
            items.filter((item): item is TreasuryAssetBalance => !!item),
          )
        : []

      const pricedAssets = mergePositivePositions(
        [],
        [
          ...walletAssets,
          ...omnipoolLiquidityAssets,
          ...xykMiningLiquidityAssets,
          ...assetHubDotAssets,
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

const getScaledFallbackPart = (
  item: TreasuryAssetBalance,
  balance: Big,
): TreasuryAssetBreakdownPart => {
  const valueUsd =
    item.valueUsd && isPositive(item.balance)
      ? balance.times(item.valueUsd).div(item.balance).toString()
      : item.valueUsd

  return {
    balance: balance.toString(),
    valueUsd,
  }
}

const getReceiptTokenSupplyFallbacks = (
  receiptAssets: TreasuryAssetBalance[],
  supplyAssets: TreasuryAssetBalance[],
  assetMap: Map<string, TAsset>,
) => {
  const remainingSupplyByAssetId = new Map<string, Big>()

  for (const item of supplyAssets) {
    const existing = remainingSupplyByAssetId.get(item.asset.id) ?? new Big(0)
    remainingSupplyByAssetId.set(
      item.asset.id,
      existing.plus(item.balance || 0),
    )
  }

  return receiptAssets
    .map((item): TreasuryAssetBalance | undefined => {
      const underlyingAssetId = getReceiptTokenUnderlyingAssetId(item.asset)
      const asset = underlyingAssetId ? assetMap.get(underlyingAssetId) : null

      if (!asset) return undefined

      const suppliedBalance =
        remainingSupplyByAssetId.get(asset.id) ?? new Big(0)
      const receiptBalance = new Big(item.balance || 0)
      const fallbackBalance = receiptBalance.minus(
        suppliedBalance.lt(receiptBalance) ? suppliedBalance : receiptBalance,
      )

      remainingSupplyByAssetId.set(
        asset.id,
        suppliedBalance.minus(receiptBalance).gt(0)
          ? suppliedBalance.minus(receiptBalance)
          : new Big(0),
      )

      if (fallbackBalance.lte(0)) return undefined

      const fallbackPart = getScaledFallbackPart(item, fallbackBalance)

      return {
        ...item,
        asset: normalizeTreasuryAsset(asset),
        balance: fallbackPart.balance,
        balanceRaw: fallbackPart.balance,
        valueUsd: fallbackPart.valueUsd,
        price: fallbackPart.valueUsd
          ? getPositionPrice(fallbackPart.balance, fallbackPart.valueUsd)
          : item.price,
        source: "moneyMarketSupply",
        breakdown: {
          moneyMarketSupply: fallbackPart,
        },
      }
    })
    .filter((item): item is TreasuryAssetBalance => !!item)
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
    const receiptWalletAssets = treasury.data.assets.filter((item) =>
      isReceiptToken(item.asset),
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
              asset: normalizeTreasuryAsset(asset),
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
              asset: normalizeTreasuryAsset(asset),
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

    const receiptSupplyFallbacks = getReceiptTokenSupplyFallbacks(
      receiptWalletAssets,
      supplyAssets,
      assetMap,
    )
    const positiveAssets = mergePositivePositions(directWalletAssets, [
      ...supplyAssets,
      ...receiptSupplyFallbacks,
    ])
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
