import { useMemo } from "react"
import BN from "bignumber.js"
import { getAccountBalances } from "api/accountBalances"
import { getSpotPrice } from "api/spotPrice"
import { NATIVE_ASSET_ID } from "utils/api"
import { BN_0, BN_10 } from "utils/constants"
import { AssetsTableData } from "sections/wallet/assets/table/WalletAssetsTable.utils"
import { PalletBalancesAccountData } from "@polkadot/types/lookup"
import { u32 } from "@polkadot/types"
import { getAssetsDetails, useAssetTable } from "api/assetDetails"
import { getTokenLock } from "api/balances"

import { useApiIds } from "api/consts"
import { useHubAssetTradability, useOmnipoolAssets } from "api/omnipool"
import {
  is_buy_allowed,
  is_sell_allowed,
  is_add_liquidity_allowed,
  is_remove_liquidity_allowed,
} from "@galacticcouncil/math-omnipool"

export const useAssetsTableData = (isAllAssets: boolean) => {
  const myTableData = useAssetTable()

  const data = useMemo(() => {
    if (!myTableData.data) return []

    const {
      tradeAssets,
      allAssets,
      accountTokenId,
      acceptedTokens,
      assetsBalances,
      apiIds,
      omnipoolAssets,
      hubAssetTradability,
    } = myTableData.data

    const assetsToShow = isAllAssets
      ? allAssets
      : allAssets.filter((asset) =>
          acceptedTokens.some(
            (acceptedToken) => acceptedToken.id === asset.id.toString(),
          ),
        )

    const results = omnipoolAssets.map((asset) => {
      const id = asset.id.toString()
      const bits = asset.data.tradable.bits.toNumber()
      const canBuy = is_buy_allowed(bits)
      const canSell = is_sell_allowed(bits)
      const canAddLiquidity = is_add_liquidity_allowed(bits)
      const canRemoveLiquidity = is_remove_liquidity_allowed(bits)

      return { id, canBuy, canSell, canAddLiquidity, canRemoveLiquidity }
    })

    const hubBits = hubAssetTradability.bits.toNumber()
    const canBuyHub = is_buy_allowed(hubBits)
    const canSellHub = is_sell_allowed(hubBits)
    const canAddLiquidityHub = is_add_liquidity_allowed(hubBits)
    const canRemoveLiquidityHub = is_remove_liquidity_allowed(hubBits)
    const hubResult = {
      id: apiIds.hubId,
      canBuy: canBuyHub,
      canSell: canSellHub,
      canAddLiquidity: canAddLiquidityHub,
      canRemoveLiquidity: canRemoveLiquidityHub,
    }

    const assetsTradability = [...results, hubResult]

    const assetsTableData = assetsToShow.map((assetValue) => {
      const inTradeRouter =
        tradeAssets.find((i) => i.id === assetValue.id?.toString()) != null

      const isPaymentFee = assetValue.id?.toString() === accountTokenId

      const couldBeSetAsPaymentFee = acceptedTokens.some(
        (currency) =>
          currency.id === assetValue.id?.toString() &&
          currency.id !== accountTokenId &&
          currency.accepted,
      )

      const balance = assetsBalances.find(
        (b) => b.id.toString() === assetValue.id.toString(),
      )

      const { id, symbol, name } = assetValue

      const tradabilityData = assetsTradability.find(
        (t) => t.id === assetValue.id.toString(),
      )

      const tradability = {
        canBuy: !!tradabilityData?.canBuy,
        canSell: !!tradabilityData?.canSell,
        canAddLiquidity: !!tradabilityData?.canAddLiquidity,
        canRemoveLiquidity: !!tradabilityData?.canRemoveLiquidity,
        inTradeRouter,
      }

      return {
        id,
        symbol,
        name,
        isPaymentFee,
        couldBeSetAsPaymentFee,
        origin: "TODO",
        transferable: balance?.transferable ?? BN_0,
        transferableUSD: balance?.transferableUSD ?? BN_0,
        total: balance?.total ?? BN_0,
        totalUSD: balance?.totalUSD ?? BN_0,
        lockedMax: balance?.lockedMax ?? BN_0,
        lockedMaxUSD: balance?.lockedMaxUSD ?? BN_0,
        lockedVesting: balance?.lockedVesting ?? BN_0,
        lockedVestingUSD: balance?.lockedVestingUSD ?? BN_0,
        lockedDemocracy: balance?.lockedDemocracy ?? BN_0,
        lockedDemocracyUSD: balance?.lockedDemocracyUSD ?? BN_0,
        reserved: balance?.reserved ?? BN_0,
        reservedUSD: balance?.reservedUSD ?? BN_0,
        tradability,
      }
    })

    return assetsTableData
      .filter((x): x is AssetsTableData => x !== null)
      .sort((a, b) => {
        // native asset first
        if (a.id === NATIVE_ASSET_ID) return -1

        if (!b.transferable.eq(a.transferable))
          return b.transferable.minus(a.transferable).toNumber()

        return a.symbol.localeCompare(b.symbol)
      })
  }, [myTableData.data, isAllAssets])

  return { data, isLoading: myTableData.isLoading }
}

export const getAssetsBalances = (
  accountBalances: Awaited<
    ReturnType<ReturnType<typeof getAccountBalances>>
  >["balances"],
  spotPrices: Array<Awaited<ReturnType<ReturnType<typeof getSpotPrice>>>>,
  assetMetas: Awaited<ReturnType<ReturnType<typeof getAssetsDetails>>>,
  locksQueries: Array<Awaited<ReturnType<ReturnType<typeof getTokenLock>>>>,
  nativeData: Awaited<
    ReturnType<ReturnType<typeof getAccountBalances>>
  >["native"],
) => {
  const locks = locksQueries.reduce(
    (acc, cur) => (cur ? [...acc, ...cur] : acc),
    [] as { id: string; amount: BN; type: string }[],
  )

  const tokens: (AssetsTableDataBalances | null)[] = accountBalances.map(
    (ab) => {
      const id = ab.id
      const spotPrice = spotPrices.find((sp) => id.toString() === sp?.tokenIn)

      const meta = assetMetas.find((am) => id.toString() === am?.id)

      if (!spotPrice || !meta || !assetMetas) return null

      const dp = BN_10.pow(meta.decimals?.toBigNumber() || 12)
      const free = ab.data.free.toBigNumber()

      const reservedBN = ab.data.reserved.toBigNumber()
      const frozen = ab.data.frozen.toBigNumber()

      const total = free.plus(reservedBN).div(dp)

      const totalUSD = total.times(spotPrice.spotPrice)

      const transferable = free.minus(frozen).div(dp)
      const transferableUSD = transferable.times(spotPrice.spotPrice)

      const reserved = reservedBN.div(dp)
      const reservedUSD = reserved.times(spotPrice.spotPrice)

      const lockMax = locks.reduce(
        (max, curr) =>
          curr.id === id.toString() && curr.amount.gt(max) ? curr.amount : max,
        BN_0,
      )

      const lockedMax = lockMax.div(dp)
      const lockedMaxUSD = lockedMax.times(spotPrice.spotPrice)

      const lockVesting = locks.find(
        (lock) => lock.id === id.toString() && lock.type === "ormlvest",
      )
      const lockedVesting = lockVesting?.amount.div(dp) ?? BN_0
      const lockedVestingUSD = lockedVesting.times(spotPrice.spotPrice)

      const lockDemocracy = locks.find(
        (lock) => lock.id === id.toString() && lock.type === "democrac",
      )
      const lockedDemocracy = lockDemocracy?.amount.div(dp) ?? BN_0
      const lockedDemocracyUSD = lockedDemocracy.times(spotPrice.spotPrice)

      return {
        id,
        total,
        totalUSD,
        transferable,
        transferableUSD,
        lockedMax,
        lockedMaxUSD,
        lockedVesting,
        lockedVestingUSD,
        lockedDemocracy,
        lockedDemocracyUSD,
        reserved,
        reservedUSD,
      }
    },
  )

  const nativeBalance = nativeData.data

  const nativeDecimals = assetMetas
    .find((am) => am?.id === NATIVE_ASSET_ID)
    ?.decimals?.toBigNumber()

  const nativeSpotPrice = spotPrices.find(
    (sp) => sp.tokenIn === NATIVE_ASSET_ID,
  )?.spotPrice

  const nativeLockMax = locks.reduce(
    (max, curr) =>
      curr.id === NATIVE_ASSET_ID && curr.amount.gt(max) ? curr.amount : max,
    BN_0,
  )
  const nativeLockVesting = locks.find(
    (lock) => lock.id === NATIVE_ASSET_ID && lock.type === "ormlvest",
  )?.amount
  const nativeLockDemocracy = locks.find(
    (lock) => lock.id === NATIVE_ASSET_ID && lock.type === "democrac",
  )?.amount

  const native = getNativeBalances(
    nativeBalance,
    nativeDecimals,
    nativeSpotPrice,
    nativeLockMax,
    nativeLockVesting,
    nativeLockDemocracy,
  )

  return [native, ...tokens].filter(
    (x): x is AssetsTableDataBalances => x !== null,
  )
}

const getNativeBalances = (
  balance: PalletBalancesAccountData,
  decimals?: BN,
  spotPrice?: BN,
  lockMax?: BN,
  lockVesting?: BN,
  lockDemocracy?: BN,
): AssetsTableDataBalances | null => {
  if (!decimals || !spotPrice) return null

  const dp = BN_10.pow(decimals)
  const free = balance.free.toBigNumber()
  const reservedBN = balance.reserved.toBigNumber()
  const feeFrozen = balance.feeFrozen.toBigNumber()
  const miscFrozen = balance.miscFrozen.toBigNumber()

  const total = free.plus(reservedBN).div(dp)
  const totalUSD = total.times(spotPrice)

  const transferable = free.minus(BN.max(feeFrozen, miscFrozen)).div(dp)
  const transferableUSD = transferable.times(spotPrice)

  const reserved = reservedBN.div(dp)
  const reservedUSD = reserved.times(spotPrice)

  const lockedMax = lockMax?.div(dp) ?? BN_0
  const lockedMaxUSD = lockedMax.times(spotPrice)

  const lockedVesting = lockVesting?.div(dp) ?? BN_0
  const lockedVestingUSD = lockedVesting.times(spotPrice)

  const lockedDemocracy = lockDemocracy?.div(dp) ?? BN_0
  const lockedDemocracyUSD = lockedDemocracy.times(spotPrice)

  return {
    id: NATIVE_ASSET_ID,
    total,
    totalUSD,
    transferable,
    transferableUSD,
    lockedMax,
    lockedMaxUSD,
    lockedVesting,
    lockedVestingUSD,
    lockedDemocracy,
    lockedDemocracyUSD,
    reserved,
    reservedUSD,
  }
}

type AssetsTableDataBalances = {
  id: string | u32
  total: BN
  totalUSD: BN
  transferable: BN
  transferableUSD: BN
  lockedMax: BN
  lockedMaxUSD: BN
  lockedVesting: BN
  lockedVestingUSD: BN
  lockedDemocracy: BN
  lockedDemocracyUSD: BN
  reserved: BN
  reservedUSD: BN
}

export const useAssetsTradability = () => {
  const assets = useOmnipoolAssets()
  const hubTradability = useHubAssetTradability()
  const apiIds = useApiIds()

  const queries = [assets, hubTradability, apiIds]
  const isLoading = queries.some((q) => q.isLoading)
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (!assets.data || !hubTradability.data || !apiIds.data) return undefined

    const results = assets.data.map((asset) => {
      const id = asset.id.toString()
      const bits = asset.data.tradable.bits.toNumber()
      const canBuy = is_buy_allowed(bits)
      const canSell = is_sell_allowed(bits)
      const canAddLiquidity = is_add_liquidity_allowed(bits)
      const canRemoveLiquidity = is_remove_liquidity_allowed(bits)

      return { id, canBuy, canSell, canAddLiquidity, canRemoveLiquidity }
    })

    const hubBits = hubTradability.data.bits.toNumber()
    const canBuyHub = is_buy_allowed(hubBits)
    const canSellHub = is_sell_allowed(hubBits)
    const canAddLiquidityHub = is_add_liquidity_allowed(hubBits)
    const canRemoveLiquidityHub = is_remove_liquidity_allowed(hubBits)
    const hubResult = {
      id: apiIds.data.hubId,
      canBuy: canBuyHub,
      canSell: canSellHub,
      canAddLiquidity: canAddLiquidityHub,
      canRemoveLiquidity: canRemoveLiquidityHub,
    }

    return [...results, hubResult]
  }, [assets, hubTradability, apiIds])

  return { data, isLoading, isInitialLoading }
}
