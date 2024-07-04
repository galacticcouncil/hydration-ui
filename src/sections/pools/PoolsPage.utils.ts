import {
  useShareTokenBalances,
  useTokenBalance,
  useTokensBalances,
} from "api/balances"
import { useHubAssetTradability, useOmnipoolAssets } from "api/omnipool"
import { useMemo } from "react"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { NATIVE_ASSET_ID } from "utils/api"
import { normalizeBigNumber } from "utils/balance"
import { BN_0, BN_1, BN_MILL, BN_NAN } from "utils/constants"
import {
  useDisplayAssetStore,
  useDisplayPrices,
  useDisplayShareTokenPrice,
} from "utils/displayAsset"
import { useStableswapPool, useStableswapPools } from "api/stableswap"
import { pool_account_name } from "@galacticcouncil/math-stableswap"
import { encodeAddress, blake2AsHex } from "@polkadot/util-crypto"
import { HYDRADX_SS58_PREFIX, XykMath } from "@galacticcouncil/sdk"
import { useAccountBalances } from "api/accountBalances"
import { isNotNil } from "utils/helpers"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useVolume } from "api/volume"
import BN from "bignumber.js"
import { useGetXYKPools, useXYKConsts } from "api/xyk"
import { useShareOfPools } from "api/pools"
import { useXYKPoolTradeVolumes } from "./pool/details/PoolDetails.utils"
import {
  useAllOmnipoolDeposits,
  useAllXYKDeposits,
} from "./farms/position/FarmingPosition.utils"
import { useFee } from "api/stats"
import { useTVL } from "api/stats"
import { scaleHuman } from "utils/balance"
import {
  is_add_liquidity_allowed,
  is_buy_allowed,
  is_remove_liquidity_allowed,
  is_sell_allowed,
} from "@galacticcouncil/math-omnipool"
import { useUserDeposits } from "api/deposits"
import { TAsset, useAssets } from "api/assetDetails"

export const XYK_TVL_VISIBILITY = 5000

export const useAssetsTradability = () => {
  const { hub } = useAssets()
  const assets = useOmnipoolAssets()
  const hubTradability = useHubAssetTradability()

  const queries = [assets, hubTradability]
  const isLoading = queries.some((q) => q.isLoading)
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (!assets.data || !hubTradability.data) return undefined

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
      id: hub.id,
      canBuy: canBuyHub,
      canSell: canSellHub,
      canAddLiquidity: canAddLiquidityHub,
      canRemoveLiquidity: canRemoveLiquidityHub,
    }

    return [...results, hubResult]
  }, [assets, hubTradability, hub])

  return { data, isLoading, isInitialLoading }
}

export type TMiningNftPosition = ReturnType<
  typeof usePoolDetails
>["data"]["miningNftPositions"][number]

export const isXYKPoolType = (pool: TPool | TXYKPool): pool is TXYKPool =>
  !!(pool as TXYKPool).shareTokenIssuance

export type TPool = NonNullable<ReturnType<typeof usePools>["data"]>[number]
export type TPoolDetails = NonNullable<
  ReturnType<typeof usePoolDetails>["data"]
>
export type TPoolFullData = TPool & TPoolDetails
export type TXYKPoolFullData = TXYKPool &
  NonNullable<ReturnType<typeof useXYKPoolDetails>["data"]>

export type TXYKPool = NonNullable<
  ReturnType<typeof useXYKPools>["data"]
>[number]

export const derivePoolAccount = (assetId: string) => {
  const name = pool_account_name(Number(assetId))
  return encodeAddress(blake2AsHex(name), HYDRADX_SS58_PREFIX)
}

const getTradeFee = (fee: string[]) => {
  if (fee?.length !== 2) return BN_NAN

  const numerator = new BN(fee[0])
  const denominator = new BN(fee[1])
  const tradeFee = numerator.div(denominator)

  return tradeFee.times(100)
}

export const usePools = () => {
  const { native } = useAssets()
  const { stableCoinId } = useDisplayAssetStore()

  const omnipoolAssets = useOmnipoolAssets()
  const stablepools = useStableswapPools()

  const assetsTradability = useAssetsTradability()

  const omnipoolPositions = useOmnipoolPositionsData()
  const miningPositions = useAllOmnipoolDeposits()

  const assetsId = useMemo(
    () => omnipoolAssets.data?.map((a) => a.id.toString()) ?? [],
    [omnipoolAssets.data],
  )

  const assetsByStablepool = [
    ...new Set(
      stablepools.data
        ?.map((stablepool) =>
          stablepool.data.assets.map((asset) => asset.toString()),
        )
        .flat(),
    ),
  ]

  const spotPrices = useDisplayPrices([
    ...assetsId,
    ...assetsByStablepool,
    stableCoinId ?? "",
  ])

  const volumes = useVolume("all")
  const fees = useFee("all")
  const tvls = useTVL("all")

  const queries = [omnipoolAssets, spotPrices, assetsTradability]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (!omnipoolAssets.data || !spotPrices.data || !assetsTradability.data)
      return undefined

    const rows = omnipoolAssets.data.map((asset) => {
      const spotPrice = spotPrices.data?.find(
        (sp) => sp?.tokenIn === asset.id,
      )?.spotPrice

      const tradabilityData = assetsTradability.data?.find(
        (t) => t.id === asset.id,
      )

      const tradability = {
        canAddLiquidity: !!tradabilityData?.canAddLiquidity,
        canRemoveLiquidity: !!tradabilityData?.canRemoveLiquidity,
      }

      const apiSpotPrice = spotPrices.data?.find(
        (sp) => sp?.tokenIn === stableCoinId,
      )?.spotPrice

      const tvlDisplay = BN(
        tvls.data?.find((tvl) => tvl.asset_id === Number(asset.id))?.tvl_usd ??
          BN_NAN,
      ).multipliedBy(apiSpotPrice ?? 1)

      const volume = BN(
        volumes.data?.find((volume) => volume.asset_id.toString() === asset.id)
          ?.volume_usd ?? BN_NAN,
      ).multipliedBy(apiSpotPrice ?? 1)

      const fee =
        native.id === asset.id
          ? BN_0
          : BN(
              fees.data?.find((fee) => fee.asset_id.toString() === asset.id)
                ?.projected_apr_perc ?? BN_NAN,
            )

      const filteredOmnipoolPositions = omnipoolPositions.data.filter(
        (omnipoolPosition) => omnipoolPosition.assetId === asset.id,
      )

      const filteredMiningPositions = miningPositions.data?.[asset.id] ?? []

      const isPositions =
        !!filteredOmnipoolPositions.length || !!filteredMiningPositions?.length

      return {
        id: asset.meta.id,
        name: asset.meta.name,
        symbol: asset.meta.symbol,
        iconId: asset.meta.iconId,
        meta: asset.meta,
        tvlDisplay,
        spotPrice,
        canAddLiquidity: tradability.canAddLiquidity,
        canRemoveLiquidity: tradability.canRemoveLiquidity,
        volume,
        isVolumeLoading: volumes?.isLoading,
        fee,
        isFeeLoading: fees?.isLoading,
        omnipoolPositions: filteredOmnipoolPositions,
        miningPositions: filteredMiningPositions,
        isPositions,
      }
    })

    return rows.sort((poolA, poolB) => {
      if (poolA.id === NATIVE_ASSET_ID) {
        return -1
      }

      if (poolB.id === NATIVE_ASSET_ID) {
        return 1
      }

      return poolA.tvlDisplay.gt(poolB.tvlDisplay) ? -1 : 1
    })
  }, [
    native.id,
    assetsTradability.data,
    fees.data,
    fees.isLoading,
    miningPositions.data,
    omnipoolAssets.data,
    omnipoolPositions.data,
    spotPrices.data,
    stableCoinId,
    tvls.data,
    volumes.data,
    volumes.isLoading,
  ])

  return { data, isLoading: isInitialLoading }
}

export const usePoolDetails = (assetId: string) => {
  const { getAsset } = useAssets()
  const meta = getAsset(assetId)
  const isStablePool = meta?.isStableSwap

  const { omnipoolDeposits } = useUserDeposits()
  const omnipoolPositions = useOmnipoolPositionsData()

  const poolAccountAddress = derivePoolAccount(assetId)

  const stablePoolBalance = useAccountBalances(
    isStablePool ? poolAccountAddress : undefined,
  )
  const stablepool = useStableswapPool(isStablePool ? assetId : undefined)

  const isInitialLoading =
    omnipoolPositions.isInitialLoading || stablePoolBalance.isInitialLoading

  const data = useMemo(() => {
    const omnipoolNftPositions = omnipoolPositions.data.filter(
      (position) => position.assetId === assetId,
    )

    const miningNftPositions = omnipoolDeposits
      .filter((position) => position.data.ammPoolId.toString() === assetId)
      .sort((a, b) => {
        const firstFarmLastBlock = a.data.yieldFarmEntries.reduce(
          (acc, curr) =>
            acc.lt(curr.enteredAt.toBigNumber())
              ? curr.enteredAt.toBigNumber()
              : acc,
          BN_0,
        )

        const secondFarmLastBlock = b.data.yieldFarmEntries.reduce(
          (acc, curr) =>
            acc.lt(curr.enteredAt.toBigNumber())
              ? curr.enteredAt.toBigNumber()
              : acc,
          BN_0,
        )

        return secondFarmLastBlock.minus(firstFarmLastBlock).toNumber()
      })

    const reserves = isStablePool
      ? (stablePoolBalance.data?.balances ?? []).map((balance) => {
          const id = balance.id.toString()
          const meta = getAsset(id) as TAsset

          return {
            asset_id: Number(id),
            decimals: meta.decimals,
            amount: balance.freeBalance.toString(),
          }
        })
      : []

    return {
      omnipoolNftPositions,
      miningNftPositions,
      reserves,
      stablepoolFee: stablepool.data?.fee
        ? normalizeBigNumber(stablepool.data.fee).div(BN_MILL)
        : undefined,
      isStablePool,
    }
  }, [
    getAsset,
    assetId,
    isStablePool,
    omnipoolDeposits,
    omnipoolPositions.data,
    stablePoolBalance.data?.balances,
    stablepool.data?.fee,
  ])

  return { data, isInitialLoading }
}

export const useMyPools = () => {
  const { account } = useAccount()
  const { stableswap } = useAssets()
  const pools = usePools()

  const omnipoolPositions = useOmnipoolPositionsData()
  const miningPositions = useAllOmnipoolDeposits()

  const stableswapsId = stableswap.map((shareToken) => shareToken.id)

  const userPositions = useTokensBalances(stableswapsId, account?.address)

  const data = useMemo(() => {
    if (
      pools.data &&
      omnipoolPositions.data &&
      miningPositions.data &&
      userPositions.every((userPosition) => userPosition.data)
    ) {
      return pools.data?.filter(
        (pool) =>
          omnipoolPositions.data.some(
            (omnipoolPosition) => omnipoolPosition.assetId === pool.id,
          ) ||
          miningPositions.data?.[pool.id] ||
          userPositions.some(
            (userPosition) =>
              userPosition.data?.assetId === pool.id &&
              userPosition.data.balance.gt(0),
          ),
      )
    }
    return undefined
  }, [miningPositions.data, omnipoolPositions.data, pools.data, userPositions])

  return {
    data,
    isLoading:
      pools.isLoading ||
      omnipoolPositions.isInitialLoading ||
      miningPositions.isLoading,
  }
}

export const useXYKPools = (withPositions?: boolean) => {
  const pools = useGetXYKPools()
  const xykConsts = useXYKConsts()
  const { getShareTokenByAddress, shareTokens } = useAssets()

  const shareTokensId = shareTokens.map((shareToken) => shareToken.id) ?? []

  const totalIssuances = useShareOfPools(shareTokensId)
  const shareTokeSpotPrices = useDisplayShareTokenPrice(shareTokensId)

  const fee = xykConsts.data?.fee ? getTradeFee(xykConsts.data?.fee) : BN_NAN

  const volumes = useXYKPoolTradeVolumes(
    shareTokens.length
      ? shareTokens.map((shareToken) => shareToken.poolAddress)
      : [],
  )

  const deposits = useAllXYKDeposits()

  const queries = [pools, xykConsts, shareTokeSpotPrices, totalIssuances]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !pools.data ||
      !shareTokens.length ||
      !shareTokeSpotPrices.data ||
      !totalIssuances.data
    )
      return undefined

    return pools.data
      .map((pool) => {
        const shareToken = getShareTokenByAddress(pool.poolAddress)

        if (!shareToken) return undefined

        const shareTokenId = shareToken.id

        const shareTokenIssuance = totalIssuances.data?.find(
          (issuance) => issuance.asset === shareTokenId,
        )

        const shareTokenSpotPrice = shareTokeSpotPrices.data.find(
          (shareTokeSpotPrice) => shareTokeSpotPrice.tokenIn === shareTokenId,
        )

        const tvlDisplay =
          shareTokenIssuance?.totalShare
            ?.shiftedBy(-shareToken.decimals)
            ?.multipliedBy(shareTokenSpotPrice?.spotPrice ?? 1) ?? BN_0

        const volume =
          volumes.data?.find(
            (volume) => volume.poolAddress === pool.poolAddress,
          )?.volume ?? BN_NAN

        const miningPositions = deposits.data.filter(
          (deposit) => deposit.assetId === shareTokenId,
        )

        return {
          id: shareToken.id,
          symbol: shareToken.symbol,
          name: shareToken.name,
          iconId: shareToken.iconId,
          meta: shareToken,
          tvlDisplay,
          spotPrice: shareTokenSpotPrice?.spotPrice,
          fee,
          isXykPool: true,
          poolAddress: pool.poolAddress,
          canAddLiquidity: true,
          canRemoveLiquidity: true,
          shareTokenIssuance,
          volume,
          isVolumeLoading: volumes.isLoading,
          miningPositions,
        }
      })
      .filter(isNotNil)
      .filter((pool) =>
        withPositions
          ? pool.shareTokenIssuance?.myPoolShare?.gt(0) ||
            pool.miningPositions.length
          : true,
      )
      .sort((a, b) => b.tvlDisplay.minus(a.tvlDisplay).toNumber())
  }, [
    pools.data,
    shareTokens.length,
    shareTokeSpotPrices.data,
    totalIssuances.data,
    getShareTokenByAddress,
    volumes.data,
    volumes.isLoading,
    deposits.data,
    fee,
    withPositions,
  ])

  return { data, isInitialLoading }
}

export const useXYKPoolDetails = (pool: TXYKPool) => {
  const volume = useXYKPoolTradeVolumes([pool.poolAddress])
  const { xykDeposits } = useUserDeposits()

  const isInitialLoading = volume.isLoading

  const miningNftPositions = xykDeposits
    .filter(
      (position) => position.data.ammPoolId.toString() === pool.poolAddress,
    )
    .sort((a, b) => {
      const firstFarmLastBlock = a.data.yieldFarmEntries.reduce(
        (acc, curr) =>
          acc.lt(curr.enteredAt.toBigNumber())
            ? curr.enteredAt.toBigNumber()
            : acc,
        BN_0,
      )

      const secondFarmLastBlock = b.data.yieldFarmEntries.reduce(
        (acc, curr) =>
          acc.lt(curr.enteredAt.toBigNumber())
            ? curr.enteredAt.toBigNumber()
            : acc,
        BN_0,
      )

      return secondFarmLastBlock.minus(firstFarmLastBlock).toNumber()
    })

  return {
    data: {
      volumeDisplay: volume.data?.[0]?.volume ?? BN_0,
      miningNftPositions,
    },
    isInitialLoading,
  }
}

export const useXYKSpotPrice = (shareTokenId: string) => {
  const { getShareToken } = useAssets()
  const shareToken = getShareToken(shareTokenId)

  const poolAddress = shareToken?.poolAddress
  const [metaA, metaB] = shareToken?.assets ?? []

  const assetABalance = useTokenBalance(metaA.id, poolAddress)
  const assetBBalance = useTokenBalance(metaB.id, poolAddress)

  if (!shareToken || !assetABalance.data || !assetBBalance.data)
    return undefined

  const priceA = scaleHuman(
    XykMath.getSpotPrice(
      assetABalance.data.balance.toString(),
      assetBBalance.data.balance.toString(),
      BN_1.shiftedBy(metaA.decimals).toString(),
    ),
    metaB.decimals,
  )

  const priceB = scaleHuman(
    XykMath.getSpotPrice(
      assetBBalance.data.balance.toString(),
      assetABalance.data.balance.toString(),
      BN_1.shiftedBy(metaB.decimals).toString(),
    ),
    metaA.decimals,
  )

  return { priceA, priceB, idA: metaA.id, idB: metaB.id }
}

export const useXYKDepositValues = (depositNfts: TMiningNftPosition[]) => {
  const { getShareTokenByAddress, getShareToken } = useAssets()
  const depositNftsData = depositNfts.reduce<
    { assetId: string; depositNft: TMiningNftPosition }[]
  >((acc, depositNft) => {
    const assetId = getShareTokenByAddress(
      depositNft.data.ammPoolId.toString(),
    )?.id

    if (assetId)
      acc.push({
        assetId,
        depositNft,
      })
    return acc
  }, [])

  const uniqAssetIds = [
    ...new Set(depositNftsData.map((deposit) => deposit.assetId)),
  ]
  const totalIssuances = useShareOfPools(uniqAssetIds)
  const balances = useShareTokenBalances(uniqAssetIds)
  const shareTokeSpotPrices = useDisplayShareTokenPrice(uniqAssetIds)

  const isLoading =
    totalIssuances.isInitialLoading ||
    balances.some((q) => q.isInitialLoading) ||
    shareTokeSpotPrices.isInitialLoading

  const data = useMemo(() => {
    const defaultValue = {
      assetA: undefined,
      assetB: undefined,
      amountUSD: undefined,
    }

    return depositNftsData.map((deposit) => {
      const shareTokenIssuance = totalIssuances.data?.find(
        (totalIssuance) => totalIssuance.asset === deposit.assetId,
      )?.totalShare

      const shareToken = getShareToken(deposit.assetId)

      if (!shareTokenIssuance || !shareToken) {
        return { ...defaultValue, assetId: deposit.assetId }
      }

      const shares = deposit.depositNft.data.shares.toBigNumber()
      const ratio = shares.div(shareTokenIssuance)
      const amountUSD = scaleHuman(shareTokenIssuance, shareToken.decimals)
        .multipliedBy(shareTokeSpotPrices.data?.[0]?.spotPrice ?? 1)
        .times(ratio)

      const [assetA, assetB] = shareToken.assets.map((asset) => {
        const balance =
          balances.find(
            (balance) =>
              balance.data?.assetId === asset.id &&
              balance.data?.accountId.toString() === shareToken.poolAddress,
          )?.data?.balance ?? BN_0
        const amount = scaleHuman(balance.times(ratio), asset.decimals)

        return {
          id: asset,
          symbol: asset.symbol,
          decimals: asset.decimals,
          amount,
        }
      })
      return {
        assetA,
        assetB,
        amountUSD,
        assetId: deposit.assetId,
        depositId: deposit.depositNft.id,
      }
    })
  }, [
    balances,
    depositNftsData,
    getShareToken,
    shareTokeSpotPrices.data,
    totalIssuances.data,
  ])

  return { data, isLoading }
}
