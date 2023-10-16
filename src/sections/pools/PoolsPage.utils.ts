import { u32 } from "@polkadot/types-codec"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import { useUserDeposits } from "api/deposits"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useUniques } from "api/uniques"
import BN from "bignumber.js"
import { useMemo } from "react"
import { useAssetsTradability } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { useAccountStore } from "state/store"
import { NATIVE_ASSET_ID, OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { getFloatingPointAmount, normalizeBigNumber } from "utils/balance"
import { BN_0, BN_MILL, BN_NAN, TRADING_FEE } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { useStableswapPools } from "api/stableswap"
import { pool_account_name } from "@galacticcouncil/math-stableswap"
import { encodeAddress, blake2AsHex } from "@polkadot/util-crypto"
import { HYDRADX_SS58_PREFIX } from "@galacticcouncil/sdk"
import { useAccountsBalances } from "api/accountBalances"
import { useRpcProvider } from "providers/rpcProvider"

export const isStablepool = (
  pool: OmnipoolPool | Stablepool,
): pool is Stablepool => "isStablepool" in pool && pool.isStablepool

export const sortPools = (pools: Array<OmnipoolPool | Stablepool>) => {
  return pools.toSorted((poolA, poolB) => {
    if (poolA.id.toString() === NATIVE_ASSET_ID) {
      return -1
    }

    if (poolB.id.toString() === NATIVE_ASSET_ID) {
      return 1
    }

    return poolA.totalDisplay.gt(poolB.totalDisplay) ? -1 : 1
  })
}

export const derivePoolAccount = (assetId: u32) => {
  const name = pool_account_name(Number(assetId))
  return encodeAddress(blake2AsHex(name), HYDRADX_SS58_PREFIX)
}

export type BalanceByAsset = Exclude<
  ReturnType<typeof useStablePools>["data"],
  undefined
>[number]["balanceByAsset"]

export type Stablepool = Exclude<
  ReturnType<typeof useStablePools>["data"],
  undefined
>[number]

export const useStablePools = () => {
  const { assets } = useRpcProvider()
  const pools = useStableswapPools()

  const poolIds = (pools.data ?? []).map((pool) => pool.id.toString())

  const poolAddressById = new Map(
    (pools.data ?? []).map((pool) => [pool.id, derivePoolAccount(pool.id)]),
  )

  const poolsBalances = useAccountsBalances(
    Array.from(poolAddressById.values()),
  )

  const omnipoolBalances = useTokensBalances(
    Array.from(poolAddressById.keys()),
    OMNIPOOL_ACCOUNT_ADDRESS,
  )

  const assetsByPool = new Map(
    (pools.data ?? []).map((pool) => [
      pool.id,
      pool.data.assets.map((asset: u32) => asset.toString()),
    ]),
  )

  const uniqueAssetIds: string[] = [
    ...new Set(poolIds.concat(...assetsByPool.values())),
  ]

  const spotPrices = useDisplayPrices(uniqueAssetIds)
  const spotPriceByAsset = new Map(
    (spotPrices?.data ?? []).map((spotPrice) => [
      spotPrice?.tokenIn,
      spotPrice,
    ]),
  )

  if (pools.isLoading || spotPrices.isLoading || poolsBalances.isLoading) {
    return { data: undefined, isLoading: true }
  }

  const data = (pools.data ?? []).map((pool) => {
    const poolAssets = assets
      .getAssets(uniqueAssetIds)
      .filter((asset) => assetsByPool.get(pool.id).includes(asset.id))

    const poolBalances = (poolsBalances.data ?? []).find(
      (p) => p.accountId === poolAddressById.get(pool.id),
    )

    const balanceByAsset = new Map(
      (poolBalances?.balances ?? []).map((balance) => {
        const id = balance.id.toString()
        const spotPrice = spotPriceByAsset.get(id)
        const decimals = normalizeBigNumber(assets.getAsset(id).decimals)

        const free = normalizeBigNumber(balance.data.free)
        const value =
          spotPrice && !spotPrice.spotPrice.isNaN()
            ? free
                .shiftedBy(decimals.negated().toNumber())
                .times(spotPrice.spotPrice)
            : BN_0

        return [id, { free, value }]
      }),
    )

    const total = Array.from(balanceByAsset.entries()).reduce(
      (acc, [, balance]) => ({
        free: acc.free.plus(balance.free),
        value: acc.value.plus(balance.value),
      }),
      { free: BN_0, value: BN_0 },
    )

    const reserves = Array.from(balanceByAsset.entries()).map(
      ([assetId, balance]) => ({
        asset_id: Number(assetId),
        decimals: assets.getAsset(assetId).decimals,
        amount: balance.free.toString(),
      }),
    )

    const balance = omnipoolBalances.find(
      (o) => o.data?.assetId.toString() === pool.id.toString(),
    )?.data?.balance

    const meta = assets.getAsset(pool.id.toString())
    const spotPrice = spotPrices.data?.find(
      (sp) => sp?.tokenIn === pool.id.toString(),
    )?.spotPrice

    const totalOmnipool = getFloatingPointAmount(balance ?? BN_0, meta.decimals)
    const totalDisplay = !spotPrice ? BN_NAN : totalOmnipool.times(spotPrice)

    return {
      id: pool.id,
      assets: poolAssets,
      total,
      totalOmnipool,
      totalDisplay,
      balanceByAsset,
      reserves,
      fee: normalizeBigNumber(pool.data.fee).div(BN_MILL),
      isStablepool: true,
    }
  })

  return { data, isLoading: false }
}

export const useOmnipoolPools = (withPositions?: boolean) => {
  const { account } = useAccountStore()
  const { assets } = useRpcProvider()
  const omnipoolAssets = useOmnipoolAssets()

  const apiIds = useApiIds()
  const spotPrices = useDisplayPrices(
    omnipoolAssets.data?.map((a) => a.id) ?? [],
  )
  const assetsTradability = useAssetsTradability()
  const balances = useTokensBalances(
    omnipoolAssets.data?.map((a) => a.id) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )
  const userDeposits = useUserDeposits()

  const queries = [
    omnipoolAssets,
    apiIds,
    uniques,
    assetsTradability,
    userDeposits,
    spotPrices,
    ...positions,
    ...balances,
  ]
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const pools = useMemo(() => {
    if (
      !omnipoolAssets.data ||
      !apiIds.data ||
      !assetsTradability.data ||
      !spotPrices.data ||
      balances.some((q) => !q.data) ||
      positions.some((q) => !q.data)
    )
      return undefined

    const rows: OmnipoolPool[] = omnipoolAssets.data
      .map((asset) => {
        const meta = assets.getAsset(asset.id.toString())

        if (!meta.isToken) return null

        const spotPrice = spotPrices.data?.find(
          (sp) => sp?.tokenIn === asset.id.toString(),
        )?.spotPrice
        const balance = balances.find(
          (b) => b.data?.assetId.toString() === asset.id.toString(),
        )?.data?.balance
        const tradabilityData = assetsTradability.data?.find(
          (t) => t.id === asset.id.toString(),
        )
        const tradability = {
          canBuy: !!tradabilityData?.canBuy,
          canSell: !!tradabilityData?.canSell,
          canAddLiquidity: !!tradabilityData?.canAddLiquidity,
          canRemoveLiquidity: !!tradabilityData?.canRemoveLiquidity,
        }

        const id = asset.id
        const symbol = meta.symbol
        const name = meta.name
        const tradeFee = TRADING_FEE

        const total = getFloatingPointAmount(balance ?? BN_0, meta.decimals)
        const totalDisplay = !spotPrice ? BN_NAN : total.times(spotPrice)

        const hasPositions = positions.some(
          (p) => p.data?.assetId.toString() === id.toString(),
        )
        const hasDeposits = userDeposits.data?.some(
          (deposit) => deposit.deposit.ammPoolId.toString() === id.toString(),
        )

        return {
          id,
          symbol,
          name,
          tradeFee,
          total,
          totalDisplay,
          tradability,
          hasPositions,
          hasDeposits,
        }
      })
      .filter((x): x is OmnipoolPool => x !== null)

    return rows
  }, [
    omnipoolAssets.data,
    apiIds.data,
    assetsTradability.data,
    spotPrices.data,
    balances,
    positions,
    assets,
    userDeposits.data,
  ])

  const data = useMemo(
    () =>
      withPositions
        ? pools?.filter((pool) => pool.hasPositions || pool.hasDeposits)
        : pools,
    [pools, withPositions],
  )

  const hasPositionsOrDeposits = useMemo(
    () => pools?.some((pool) => pool.hasPositions || pool.hasDeposits),
    [pools],
  )

  return { data, hasPositionsOrDeposits, isLoading: isInitialLoading }
}

export type OmnipoolPool = {
  id: u32
  symbol: string
  name: string
  tradeFee: BN
  total: BN
  totalDisplay: BN
  tradability: {
    canSell: boolean
    canBuy: boolean
    canAddLiquidity: boolean
    canRemoveLiquidity: boolean
  }
  hasPositions: boolean
  hasDeposits: boolean
}
