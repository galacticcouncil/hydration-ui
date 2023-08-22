import { u32 } from "@polkadot/types-codec"
import { useAssetDetailsList } from "api/assetDetails"
import { useAssetMetaList } from "api/assetMeta"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import { useUserDeposits } from "api/deposits"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useUniques } from "api/uniques"
import BN from "bignumber.js"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import { useMemo } from "react"
import { useAssetsTradability } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { useAccountStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { getFloatingPointAmount, normalizeBigNumber } from "utils/balance"
import { BN_0, BN_NAN, TRADING_FEE } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { useStableswapPools } from "api/stableswap"
import { pool_account_name } from "@galacticcouncil/math-stableswap"
import { encodeAddress, blake2AsHex } from "@polkadot/util-crypto"
import { HYDRADX_SS58_PREFIX } from "@galacticcouncil/sdk"
import { useAccountsBalances } from "api/accountBalances"

export const derivePoolAccount = (assetId: u32) => {
  const name = pool_account_name(Number(assetId))
  return encodeAddress(blake2AsHex(name), HYDRADX_SS58_PREFIX)
}

export type AssetMetaById = Exclude<
  ReturnType<typeof useStablePools>["data"],
  undefined
>[number]["assetMetaById"]

export type BalanceByAsset = Exclude<
  ReturnType<typeof useStablePools>["data"],
  undefined
>[number]["balanceByAsset"]

export const useStablePools = () => {
  const pools = useStableswapPools()

  const poolAddressById = new Map(
    (pools.data ?? []).map((pool) => [pool.id, derivePoolAccount(pool.id)]),
  )
  const poolsBalances = useAccountsBalances(
    Array.from(poolAddressById.values()),
  )

  const assetsByPool = new Map(
    (pools.data ?? []).map((pool) => [
      pool.id,
      pool.data.assets.map((asset: u32) => asset.toString()),
    ]),
  )

  const uniqueAssetIds: string[] = [
    ...new Set([].concat(...assetsByPool.values())),
  ]

  const assetMetas = useAssetMetaList(uniqueAssetIds)
  const assetMetaById = new Map(
    (assetMetas?.data ?? []).map((asset) => [asset.id, asset]),
  )

  const spotPrices = useDisplayPrices(uniqueAssetIds)
  const spotPriceByAsset = new Map(
    (spotPrices?.data ?? []).map((spotPrice) => [
      spotPrice?.tokenIn,
      spotPrice,
    ]),
  )

  if (
    pools.isLoading ||
    assetMetas.isLoading ||
    spotPrices.isLoading ||
    poolsBalances.isLoading
  ) {
    return { data: undefined, isLoading: true }
  }

  const data = (pools.data ?? []).map((pool) => {
    const poolAssets = (assetMetas.data ?? []).filter((asset) =>
      assetsByPool.get(pool.id).includes(asset.id),
    )

    const poolBalances = (poolsBalances.data ?? []).find(
      (p) => p.accountId === poolAddressById.get(pool.id),
    )

    const balanceByAsset = new Map(
      (poolBalances?.balances ?? []).map((balance) => {
        const id = balance.id.toString()
        const spotPrice = spotPriceByAsset.get(id)
        const decimals = normalizeBigNumber(
          assetMetaById.get(id)?.decimals ?? 12,
        )

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
        amount: balance.free.toString(),
      }),
    )

    return {
      id: pool.id,
      assets: poolAssets,
      total,
      balanceByAsset,
      assetMetaById,
      reserves,
      tradeFee: normalizeBigNumber(pool.data.tradeFee).div(10000),
      withdrawFee: normalizeBigNumber(pool.data.withdrawFee).div(10000),
    }
  })

  return { data, isLoading: false }
}

export const useOmnipoolPools = (withPositions?: boolean) => {
  const { account } = useAccountStore()
  const assets = useOmnipoolAssets()
  const assetDetails = useAssetDetailsList(assets.data?.map((a) => a.id) ?? [])
  const metas = useAssetMetaList(assets.data?.map((a) => a.id) ?? [])
  const apiIds = useApiIds()
  const spotPrices = useDisplayPrices(assets.data?.map((a) => a.id) ?? [])
  const assetsTradability = useAssetsTradability()
  const balances = useTokensBalances(
    assets.data?.map((a) => a.id) ?? [],
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
    assets,
    assetDetails,
    metas,
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
      !assets.data ||
      !assetDetails.data ||
      !metas.data ||
      !apiIds.data ||
      !assetsTradability.data ||
      !spotPrices.data ||
      balances.some((q) => !q.data) ||
      positions.some((q) => !q.data)
    )
      return undefined

    const rows: OmnipoolPool[] = assets.data
      .map((asset) => {
        const details = assetDetails.data.find(
          (d) => d.id.toString() === asset.id.toString(),
        )
        const meta = metas.data?.find(
          (m) => m.id.toString() === asset.id.toString(),
        )
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
        const symbol = meta?.symbol ?? "N/A"
        const name = details?.name || getAssetName(meta?.symbol)
        const tradeFee = TRADING_FEE

        const total = getFloatingPointAmount(
          balance ?? BN_0,
          meta?.decimals?.toNumber() ?? 12,
        )
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
    assets.data,
    assetDetails.data,
    metas.data,
    apiIds.data,
    spotPrices,
    balances,
    positions,
    assetsTradability.data,
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
