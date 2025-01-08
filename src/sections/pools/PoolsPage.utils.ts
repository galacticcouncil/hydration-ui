import { useOmnipoolDataObserver } from "api/omnipool"
import { useMemo } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { normalizeBigNumber } from "utils/balance"
import { BN_0, BN_1, BN_MILL, BN_NAN } from "utils/constants"
import {
  useDisplayAssetStore,
  useDisplayPrices,
  useDisplayShareTokenPrice,
} from "utils/displayAsset"
import { useStableSDKPools, useStableswapPool } from "api/stableswap"
import { pool_account_name } from "@galacticcouncil/math-stableswap"
import { encodeAddress, blake2AsHex } from "@polkadot/util-crypto"
import { HYDRADX_SS58_PREFIX, XykMath } from "@galacticcouncil/sdk"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useVolume } from "api/volume"
import BN from "bignumber.js"
import { useXYKConsts, useXYKSDKPools } from "api/xyk"
import { useShareOfPools } from "api/pools"
import { useXYKPoolTradeVolumes } from "./pool/details/PoolDetails.utils"
import { useFee } from "api/stats"
import { useTVL } from "api/stats"
import { scaleHuman } from "utils/balance"
import { useAccountAssets } from "api/deposits"
import { TAsset, TShareToken, useAssets } from "providers/assets"
import { MetadataStore } from "@galacticcouncil/ui"
import { getTradabilityFromBits } from "api/omnipool"
import { useOmnipoolFarms, useXYKFarms } from "api/farms"

export const isXYKPoolType = (pool: TPool | TXYKPool): pool is TXYKPool =>
  !!(pool as TXYKPool).shareTokenIssuance

export type TPool = NonNullable<ReturnType<typeof usePools>["data"]>[number]
export type TPoolDetails = NonNullable<
  ReturnType<typeof usePoolDetails>["data"]
>
export type TPoolFullData = TPool & TPoolDetails

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
  const { native, getAssetWithFallback } = useAssets()
  const { stableCoinId } = useDisplayAssetStore()

  const omnipoolAssets = useOmnipoolDataObserver()
  const accountAssets = useAccountAssets()

  const assetsId = useMemo(
    () => omnipoolAssets.data?.map((a) => a.id) ?? [],
    [omnipoolAssets.data],
  )
  const { data: allFarms, isLoading: isAllFarmsLoading } =
    useOmnipoolFarms(assetsId)

  const spotPrices = useDisplayPrices(
    stableCoinId ? [...assetsId, stableCoinId] : assetsId,
  )

  const volumes = useVolume("all")
  const fees = useFee("all")
  const tvls = useTVL("all")

  const isInitialLoading =
    spotPrices.isInitialLoading || omnipoolAssets.isLoading

  const data = useMemo(() => {
    if (!omnipoolAssets.data || !spotPrices.data) return undefined

    const rows = omnipoolAssets.data.map((asset) => {
      const meta = getAssetWithFallback(asset.id)
      const accountAsset = accountAssets.data?.accountAssetsMap.get(asset.id)

      const spotPrice = spotPrices.data?.find(
        (sp) => sp?.tokenIn === asset.id,
      )?.spotPrice

      const tradability = getTradabilityFromBits(asset.bits ?? 0)

      const apiSpotPrice = spotPrices.data?.find(
        (sp) => sp?.tokenIn === stableCoinId,
      )?.spotPrice

      const tvlDisplay = BN(
        tvls.data?.find((tvl) => tvl?.asset_id === Number(asset.id))?.tvl_usd ??
          BN_NAN,
      ).multipliedBy(apiSpotPrice ?? 1)

      const volume = volumes.data?.find(
        (volume) => volume?.asset_id?.toString() === asset.id,
      )?.volume_usd

      const isFeeLoading = fees?.isLoading || isAllFarmsLoading

      const { totalApr, farms = [] } = allFarms?.get(asset.id) ?? {}

      const fee =
        native.id === asset.id
          ? BN_0
          : BN(
              fees.data?.find((fee) => fee?.asset_id?.toString() === asset.id)
                ?.projected_apr_perc ?? BN_NAN,
            )

      const totalFee = !isFeeLoading ? fee.plus(totalApr ?? 0) : BN_NAN

      const filteredOmnipoolPositions = accountAsset?.liquidityPositions ?? []
      const filteredMiningPositions = accountAsset?.omnipoolDeposits ?? []
      const isPositions = !!accountAsset?.isPoolPositions

      return {
        id: asset.id,
        name: meta.name,
        symbol: meta.symbol,
        iconId: meta.iconId,
        meta,
        tvlDisplay,
        spotPrice: spotPrice?.isNaN() ? undefined : spotPrice?.toFixed(6),
        canAddLiquidity: tradability.canAddLiquidity,
        canRemoveLiquidity: tradability.canRemoveLiquidity,
        volume: volume
          ? BN(volume)
              .multipliedBy(apiSpotPrice ?? 1)
              .toFixed(3)
          : undefined,
        isVolumeLoading: volumes?.isLoading,
        farms: farms.filter((farm) => farm.isActive && BN(farm.apr).gt(0)),
        allFarms: farms.filter((farm) =>
          farm.isActive ? BN(farm.apr).gt(0) : true,
        ),
        fee,
        totalFee,
        isFeeLoading,
        omnipoolPositions: filteredOmnipoolPositions,
        miningPositions: filteredMiningPositions,
        balance: accountAsset?.balance,
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
    omnipoolAssets.data,
    spotPrices.data,
    tvls.data,
    volumes.data,
    volumes?.isLoading,
    native.id,
    fees.data,
    fees?.isLoading,
    accountAssets.data,
    stableCoinId,
    getAssetWithFallback,
    allFarms,
    isAllFarmsLoading,
  ])

  return { data, isLoading: isInitialLoading }
}

export const usePoolDetails = (assetId: string) => {
  const { getAsset } = useAssets()
  const meta = getAsset(assetId)
  const isStablePool = meta?.isStableSwap

  const omnipoolPositions = useOmnipoolPositionsData()
  const { data: stablePools, isLoading } = useStableSDKPools()
  const stablePoolBalance = isStablePool
    ? stablePools
        ?.find((stablePool) => stablePool.id === assetId)
        ?.tokens.filter((token) => token.type === "Token")
    : undefined

  const stablepool = useStableswapPool(isStablePool ? assetId : undefined)

  const data = useMemo(() => {
    const omnipoolNftPositions = omnipoolPositions.data.filter(
      (position) => position.assetId === assetId,
    )

    const reserves = isStablePool
      ? (stablePoolBalance ?? []).map((token) => {
          const id = token.id
          const meta = getAsset(id) as TAsset

          return {
            asset_id: Number(id),
            decimals: meta.decimals,
            amount: token.balance,
          }
        })
      : []

    return {
      omnipoolNftPositions,
      reserves,
      stablepoolFee: stablepool.data?.fee
        ? normalizeBigNumber(stablepool.data.fee).div(BN_MILL)
        : undefined,
      isStablePool,
      stablePoolBalance,
    }
  }, [
    getAsset,
    assetId,
    isStablePool,
    omnipoolPositions.data,
    stablepool.data?.fee,
    stablePoolBalance,
  ])

  return { data, isInitialLoading: isLoading }
}

export const useXYKPools = () => {
  const { data: xykConsts } = useXYKConsts()
  const { shareTokens } = useAssets()
  const { data: accountAssets } = useAccountAssets()

  const whitelist = useMemo(
    () => MetadataStore.getInstance().externalWhitelist(),
    [],
  )

  const { validShareTokens, allShareTokens } = useMemo(() => {
    return shareTokens.reduce<{
      allShareTokens: Array<TShareToken & { isInvalid: boolean }>
      validShareTokens: Array<TShareToken>
    }>(
      (acc, shareToken) => {
        const isInvalid = !shareToken.assets.some(
          (asset) => asset.isSufficient || whitelist.includes(asset.id),
        )

        if (!isInvalid) acc.validShareTokens.push(shareToken)

        acc.allShareTokens.push({ ...shareToken, isInvalid })
        return acc
      },
      {
        allShareTokens: [],
        validShareTokens: [],
      },
    )
  }, [shareTokens, whitelist])

  const { data: allFarms, isLoading: isLoadingAllFarms } = useXYKFarms(
    allShareTokens.map((pool) => pool.poolAddress) ?? [],
  )

  const shareTokensId = shareTokens.map((shareToken) => shareToken.id) ?? []

  const totalIssuances = useShareOfPools(shareTokensId)
  const shareTokeSpotPrices = useDisplayShareTokenPrice(shareTokensId)

  const fee = xykConsts?.fee ? getTradeFee(xykConsts.fee) : BN_NAN

  const { data: volumes, isLoading: isVolumeLoading } =
    useXYKPoolTradeVolumes(validShareTokens)

  const queries = [shareTokeSpotPrices, totalIssuances]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (!shareTokeSpotPrices.data || !totalIssuances.data) return undefined

    return allShareTokens
      .map((shareToken) => {
        const accountAsset = accountAssets?.accountAssetsMap.get(shareToken.id)

        const { id: shareTokenId, poolAddress, isInvalid } = shareToken

        const shareTokenIssuance = totalIssuances.data?.find(
          (issuance) => issuance.asset === shareTokenId,
        )

        const shareTokenSpotPrice = shareTokeSpotPrices.data.find(
          (shareTokeSpotPrice) => shareTokeSpotPrice.tokenIn === shareTokenId,
        )

        const tvlDisplay =
          shareTokenIssuance?.totalShare
            ?.shiftedBy(-shareToken.decimals)
            ?.multipliedBy(shareTokenSpotPrice?.spotPrice ?? BN_NAN) ?? BN_NAN

        const volume = volumes?.find(
          (volume) => volume.poolAddress === poolAddress,
        )?.volume

        const isFeeLoading = isLoadingAllFarms
        const { totalApr, farms = [] } =
          allFarms?.get(shareToken.poolAddress) ?? {}
        const totalFee = !isFeeLoading ? fee.plus(totalApr ?? 0) : BN_NAN

        const miningPositions = accountAsset?.xykDeposits ?? []
        const balance = accountAsset?.balance
        const isPositions = !!accountAsset?.isPoolPositions

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
          poolAddress,
          canAddLiquidity: true,
          canRemoveLiquidity: true,
          shareTokenIssuance,
          volume,
          isVolumeLoading,
          miningPositions,
          isInvalid,
          balance,
          isPositions,
          totalFee,
          farms: farms.filter((farm) => farm.isActive && BN(farm.apr).gt(0)),
          allFarms: farms.filter((farm) =>
            farm.isActive ? BN(farm.apr).gt(0) : true,
          ),
          isFeeLoading,
        }
      })
      .sort((a, b) => {
        if (a.isInvalid) return 1
        if (b.isInvalid) return -1

        if (a.tvlDisplay.isNaN()) return 1
        if (b.tvlDisplay.isNaN()) return -1

        return b.tvlDisplay.minus(a.tvlDisplay).toNumber()
      })
  }, [
    shareTokeSpotPrices.data,
    totalIssuances.data,
    allShareTokens,
    accountAssets?.accountAssetsMap,
    volumes,
    isLoadingAllFarms,
    allFarms,
    fee,
    isVolumeLoading,
  ])

  return { data, isInitialLoading }
}

export const useXYKSpotPrice = (shareTokenId: string) => {
  const { getShareToken } = useAssets()

  const shareToken = getShareToken(shareTokenId)

  const poolAddress = shareToken?.poolAddress
  const [metaA, metaB] = shareToken?.assets ?? []

  const { data: xykPools } = useXYKSDKPools()
  const [assetABalance, assetBBalance] =
    xykPools?.find((xykPool) => xykPool.address === poolAddress)?.tokens ?? []

  if (!shareToken || !assetABalance || !assetBBalance) return undefined

  const priceA = scaleHuman(
    XykMath.getSpotPrice(
      assetABalance.balance.toString(),
      assetBBalance.balance.toString(),
      BN_1.shiftedBy(metaA.decimals).toString(),
    ),
    metaB.decimals,
  )

  const priceB = scaleHuman(
    XykMath.getSpotPrice(
      assetBBalance.balance.toString(),
      assetABalance.balance.toString(),
      BN_1.shiftedBy(metaB.decimals).toString(),
    ),
    metaA.decimals,
  )

  return { priceA, priceB, assetA: metaA, assetB: metaB }
}
