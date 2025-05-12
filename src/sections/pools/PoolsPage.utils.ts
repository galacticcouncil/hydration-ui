import { useOmnipoolDataObserver } from "api/omnipool"
import { useMemo } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import { normalizeBigNumber } from "utils/balance"
import {
  BN_0,
  BN_1,
  BN_MILL,
  BN_NAN,
  GDOT_ERC20_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  VALID_STABLEPOOLS,
} from "utils/constants"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { useStableSDKPools, useStableswapPool } from "api/stableswap"
import { XykMath } from "@galacticcouncil/sdk"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { useOmnipoolVolumes, useStablepoolVolumes } from "api/volume"
import BN from "bignumber.js"
import { useXYKConsts, useXYKSDKPools } from "api/xyk"
import { useXYKPoolTradeVolumes } from "./pool/details/PoolDetails.utils"
import { useFee } from "api/stats"
import { scaleHuman } from "utils/balance"
import { useAccountAssets } from "api/deposits"
import { TShareToken, useAssets } from "providers/assets"
import { getTradabilityFromBits } from "api/omnipool"
import { useOmnipoolFarms, useXYKFarms } from "api/farms"
import { useAssetsPrice } from "state/displayPrice"
import { useTotalIssuances } from "api/totalIssuance"
import { useBorrowAssetApy } from "api/borrow"
import { useValidXYKPoolAddresses } from "state/store"
import { useShallow } from "hooks/useShallow"

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

const getTradeFee = (fee: string[]) => {
  if (fee?.length !== 2) return BN_NAN

  const numerator = new BN(fee[0])
  const denominator = new BN(fee[1])
  const tradeFee = numerator.div(denominator)

  return tradeFee.times(100)
}

const useStablepools = () => {
  const { getAssetWithFallback } = useAssets()
  const { data: accountAssets } = useAccountAssets()
  const { data: stablepools = [], isLoading: isPoolsLoading } =
    useStableSDKPools()

  const filteredStablepools = useMemo(
    () =>
      stablepools.filter(
        (stablepool) =>
          stablepool.id && VALID_STABLEPOOLS.includes(stablepool.id),
      ),
    [stablepools],
  )

  const stablepoolIds = filteredStablepools.map((stablepool) => stablepool.id)

  const stableswapTokensId = [
    ...new Set(
      filteredStablepools.flatMap((stablepool) =>
        stablepool.tokens.map((token) => token.id),
      ),
    ),
  ]

  const { isLoading: isLoadingPrices, getAssetPrice } = useAssetsPrice([
    ...stableswapTokensId,
    ...stablepoolIds,
  ])

  const borrow = useBorrowAssetApy(
    filteredStablepools.some((pool) => pool.id === GDOT_STABLESWAP_ASSET_ID)
      ? GDOT_STABLESWAP_ASSET_ID
      : "",
  )

  const { data: volumes, isLoading: isVolumeLoading } = useStablepoolVolumes()

  const isLoading = isPoolsLoading || isLoadingPrices

  const data = useMemo(() => {
    if (isLoading || !filteredStablepools.length) return []

    return filteredStablepools.map((filteredStablepool) => {
      const isGigaDOT = GDOT_STABLESWAP_ASSET_ID === filteredStablepool.id
      const meta = getAssetWithFallback(filteredStablepool.id)
      const metaOverride = isGigaDOT
        ? getAssetWithFallback(GDOT_ERC20_ASSET_ID)
        : undefined

      const accountAsset = accountAssets?.accountAssetsMap.get(
        isGigaDOT ? GDOT_ERC20_ASSET_ID : filteredStablepool.id,
      )

      const isPositions =
        !!accountAsset?.isPoolPositions ||
        BN(accountAsset?.balance?.balance ?? 0).gt(0)

      const price = getAssetPrice(filteredStablepool.id).price

      const volume =
        volumes
          ?.find((volume) => volume.poolId === filteredStablepool.id)
          ?.volumes.reduce((acc, volume) => {
            const price = getAssetPrice(volume.assetId).price
            const meta = getAssetWithFallback(volume.assetId)
            const volumeDisplay = BN(volume.assetVolume)
              .shiftedBy(-meta.decimals)
              .times(price)

            return acc.plus(volumeDisplay)
          }, BN_0)
          .toString() ?? "0"

      const tvlDisplay = filteredStablepool.tokens.reduce((acc, token) => {
        if (token.type !== "Token" && token.type !== "Erc20") return acc

        const price = getAssetPrice(token.id).price
        const meta = getAssetWithFallback(token.id)

        const tvlDisplay = BN(token.balance)
          .shiftedBy(-meta.decimals)
          .times(price)

        return acc.plus(tvlDisplay)
      }, BN_0)

      const fee = isGigaDOT ? BN(borrow.totalSupplyApy) : BN_NAN

      const name = metaOverride?.name || meta.name
      const symbol = metaOverride?.symbol || meta.symbol
      const iconId = metaOverride?.iconId || meta.iconId

      return {
        id: filteredStablepool.id,
        name,
        symbol,
        meta: {
          ...meta,
          name,
          symbol,
          iconId,
        },
        tvlDisplay,
        spotPrice: price,
        volume,
        isVolumeLoading,
        farms: [],
        allFarms: [],
        fee: BN_NAN,
        totalFee: fee,
        isFeeLoading: false,
        canAddLiquidity: false,
        canRemoveLiquidity: true,
        omnipoolPositions: [],
        miningPositions: [],
        balance: accountAsset?.balance,
        isPositions,
        isGigaDOT,
      }
    })
  }, [
    isLoading,
    filteredStablepools,
    accountAssets?.accountAssetsMap,
    getAssetWithFallback,
    volumes,
    isVolumeLoading,
    getAssetPrice,
    borrow.totalSupplyApy,
  ])

  return { data, isLoading }
}

export const usePools = () => {
  const { native, getAssetWithFallback } = useAssets()

  const omnipoolAssets = useOmnipoolDataObserver()
  const { data: accountAssets } = useAccountAssets()

  const { data: stablepools, isLoading: isLoadingStablepools } =
    useStablepools()

  const assetsId = useMemo(
    () => omnipoolAssets.data?.map((a) => a.id) ?? [],
    [omnipoolAssets.data],
  )
  const { data: allFarms, isLoading: isAllFarmsLoading } =
    useOmnipoolFarms(assetsId)

  const { isLoading, getAssetPrice } = useAssetsPrice(assetsId)

  const { data: fees, isLoading: isFeeLoading } = useFee("all")

  const { data: volumes, isLoading: isVolumeLoading } = useOmnipoolVolumes()

  const isInitialLoading =
    omnipoolAssets.isLoading || isLoading || isLoadingStablepools

  const data = useMemo(() => {
    if (!omnipoolAssets.data || isLoading) return undefined

    const rows = omnipoolAssets.data.map((asset) => {
      const meta = getAssetWithFallback(asset.id)
      const accountAsset = accountAssets?.accountAssetsMap.get(asset.id)

      const spotPrice = getAssetPrice(asset.id).price
      const tradability = getTradabilityFromBits(asset.bits ?? 0)

      const tvlDisplay = BN(asset.balance)
        .times(spotPrice)
        .shiftedBy(-meta.decimals)

      const volumeRaw = volumes?.find(
        (volume) => volume.assetId === asset.id,
      )?.assetVolume

      const volume =
        volumeRaw && spotPrice
          ? BN(volumeRaw)
              .shiftedBy(-meta.decimals)
              .multipliedBy(spotPrice)
              .toString()
          : undefined

      const isTotalFeeLoading = isFeeLoading || isAllFarmsLoading

      const { totalApr, farms = [] } = allFarms?.get(asset.id) ?? {}

      const fee =
        native.id === asset.id
          ? BN_0
          : BN(
              fees?.find((fee) => fee?.asset_id?.toString() === asset.id)
                ?.projected_apr_perc ?? BN_NAN,
            )

      const totalFee = !isTotalFeeLoading ? fee.plus(totalApr ?? 0) : BN_NAN

      const filteredOmnipoolPositions = accountAsset?.liquidityPositions ?? []
      const filteredMiningPositions = accountAsset?.omnipoolDeposits ?? []
      const isPositions = !!accountAsset?.isPoolPositions

      return {
        id: asset.id,
        name: meta.name,
        symbol: meta.symbol,
        meta,
        tvlDisplay,
        spotPrice: spotPrice,
        canAddLiquidity: tradability.canAddLiquidity,
        canRemoveLiquidity: tradability.canRemoveLiquidity,
        volume,
        isVolumeLoading: isVolumeLoading,
        farms: farms.filter((farm) => farm.isActive && BN(farm.apr).gt(0)),
        allFarms: farms.filter((farm) =>
          farm.isActive ? BN(farm.apr).gt(0) : true,
        ),
        fee,
        totalFee,
        isFeeLoading: isTotalFeeLoading,
        omnipoolPositions: filteredOmnipoolPositions,
        miningPositions: filteredMiningPositions,
        balance: accountAsset?.balance,
        isPositions,
        isGigaDOT: false,
      }
    })

    return rows
  }, [
    omnipoolAssets.data,
    native.id,
    accountAssets,
    getAssetWithFallback,
    allFarms,
    isAllFarmsLoading,
    volumes,
    isVolumeLoading,
    getAssetPrice,
    isLoading,
    fees,
    isFeeLoading,
  ])

  const sortedData = useMemo(() => {
    return data
      ? [...data, ...stablepools].sort((poolA, poolB) => {
          if (poolA.id === NATIVE_ASSET_ID) {
            return -1
          }

          if (poolB.id === NATIVE_ASSET_ID) {
            return 1
          }

          if (poolA.id === GDOT_STABLESWAP_ASSET_ID) {
            return -1
          }

          if (poolB.id === GDOT_STABLESWAP_ASSET_ID) {
            return 1
          }

          return poolA.tvlDisplay.gt(poolB.tvlDisplay) ? -1 : 1
        })
      : undefined
  }, [data, stablepools])

  return {
    data: sortedData,
    isLoading: isInitialLoading,
  }
}

export const usePoolDetails = (assetId: string) => {
  const { getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(assetId)
  const isStablePool = meta?.isStableSwap

  const omnipoolPositions = useOmnipoolPositionsData()
  const { data: stablePools, isLoading } = useStableSDKPools()
  const stablePoolBalance = isStablePool
    ? stablePools
        ?.find((stablePool) => stablePool.id === assetId)
        ?.tokens.filter(
          (token) => token.type === "Token" || token.type === "Erc20",
        )
    : undefined

  const stablepool = useStableswapPool(isStablePool ? assetId : undefined)

  const data = useMemo(() => {
    const omnipoolNftPositions = omnipoolPositions.data.filter(
      (position) => position.assetId === assetId,
    )

    const reserves = isStablePool
      ? (stablePoolBalance ?? []).map((token) => {
          const id = token.id
          const meta = getAssetWithFallback(id)

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
    getAssetWithFallback,
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
  const addresses = useValidXYKPoolAddresses(
    useShallow((state) => state.addresses),
  )

  const { validShareTokens, allShareTokens } = useMemo(() => {
    return shareTokens.reduce<{
      allShareTokens: Array<TShareToken & { isInvalid: boolean }>
      validShareTokens: Array<TShareToken>
    }>(
      (acc, shareToken) => {
        const isInvalid = !addresses?.includes(shareToken.poolAddress)

        if (!isInvalid) acc.validShareTokens.push(shareToken)

        acc.allShareTokens.push({ ...shareToken, isInvalid })
        return acc
      },
      {
        allShareTokens: [],
        validShareTokens: [],
      },
    )
  }, [shareTokens, addresses])
  const { data: allFarms, isLoading: isLoadingAllFarms } = useXYKFarms(
    addresses ?? [],
  )

  const shareTokensId =
    validShareTokens.map((shareToken) => shareToken.id) ?? []

  const { data: totalIssuances, isInitialLoading: isIssuanceLoading } =
    useTotalIssuances()

  const shareTokeSpotPrices = useDisplayShareTokenPrice(shareTokensId)

  const fee = xykConsts?.fee ? getTradeFee(xykConsts.fee) : BN_NAN

  const { data: volumes, isLoading: isVolumeLoading } = useXYKPoolTradeVolumes()

  const isInitialLoading =
    isIssuanceLoading || shareTokeSpotPrices.isInitialLoading

  const data = useMemo(() => {
    if (!shareTokeSpotPrices.data || !totalIssuances) return undefined

    return allShareTokens
      .map((shareToken) => {
        const accountAsset = accountAssets?.accountAssetsMap.get(shareToken.id)
        const balance = accountAsset?.balance

        const { id: shareTokenId, poolAddress, isInvalid } = shareToken

        const issuance = totalIssuances.get(shareTokenId)

        const shareTokenSpotPrice = shareTokeSpotPrices.data.find(
          (shareTokeSpotPrice) => shareTokeSpotPrice.tokenIn === shareTokenId,
        )

        const myPoolShare =
          balance && issuance
            ? BN(balance.total).div(issuance).multipliedBy(100)
            : undefined

        const tvlDisplay =
          issuance
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
          shareTokenIssuance: { totalShare: issuance, myPoolShare },
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
    totalIssuances,
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

export const useOmnipoolsTotals = () => {
  const pools = usePools()

  const omnipoolTotals = useMemo(
    () => calculatePoolsTotals(pools.data),
    [pools.data],
  )

  return {
    ...omnipoolTotals,
    isLoading: pools.isLoading,
  }
}

export const useXykTotals = () => {
  const xykPools = useXYKPools()

  const xykTotals = useMemo(
    () => calculateXykTotals(xykPools.data),
    [xykPools.data],
  )
  return {
    ...xykTotals,
    isLoading: xykPools.isInitialLoading,
  }
}

export const useStablepoolsTotals = () => {
  const { getAssetWithFallback } = useAssets()
  const { data: stablePools, isLoading: isPoolLoading } = useStableSDKPools()

  const totalBalances =
    stablePools?.reduce<Record<string, BN>>((memo, stablePool) => {
      stablePool.tokens.forEach((token) => {
        const id = token.id
        const free = token.balance

        if (token.type === "Token") {
          if (memo[id]) {
            memo[id] = BN(memo[id]).plus(free)
          } else {
            memo[id] = BN(free)
          }
        }
      })

      return memo
    }, {}) ?? {}

  const { getAssetPrice, isLoading: isLoadingPrices } = useAssetsPrice(
    Object.keys(totalBalances),
  )

  const isLoading = isPoolLoading || isLoadingPrices
  const total = !isLoadingPrices
    ? Object.entries(totalBalances).reduce((memo, totalBalance) => {
        const [assetId, balance] = totalBalance

        const spotPrice = getAssetPrice(assetId).price

        const meta = getAssetWithFallback(assetId)

        const balanceDisplay = balance
          .shiftedBy(-meta.decimals)
          .multipliedBy(spotPrice)

        return memo.plus(balanceDisplay)
      }, BN_0)
    : BN_0

  return {
    tvl: total.toString(),
    isLoading: isLoading,
  }
}

export const calculatePoolsTotals = (
  pools: ReturnType<typeof usePools>["data"],
) => {
  const defaultValues = {
    tvl: "0",
    volume: "0",
  }
  if (!pools) return defaultValues
  return pools.reduce((acc, pool) => {
    const isGDOT = pool.id === GDOT_STABLESWAP_ASSET_ID
    acc.tvl = BN(acc.tvl)
      .plus(pool.tvlDisplay.isNaN() || isGDOT ? BN_0 : pool.tvlDisplay)
      .toString()
    acc.volume = BN(acc.volume)
      .plus(BN(pool.volume ?? 0).div(isGDOT ? 1 : 2))
      .toString()

    return acc
  }, defaultValues)
}

export const calculateXykTotals = (
  xyk: ReturnType<typeof useXYKPools>["data"],
) => {
  const defaultValues = {
    tvl: "0",
    volume: "0",
  }
  if (!xyk) return defaultValues
  return xyk.reduce((acc, xykPool) => {
    if (!xykPool.isInvalid) {
      acc.tvl = BN(acc.tvl)
        .plus(!xykPool.tvlDisplay.isNaN() ? xykPool.tvlDisplay : BN_0)
        .toString()
      acc.volume = BN(acc.volume)
        .plus(
          xykPool.volume && !BN(xykPool.volume).isNaN() ? xykPool.volume : 0,
        )
        .toString()
    }

    return acc
  }, defaultValues)
}
