import { useOmnipoolYieldMetrics, useOmnipoolDataObserver } from "api/omnipool"
import { useMemo } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import {
  BN_0,
  BN_1,
  BN_NAN,
  GDOT_ERC20_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  GETH_ERC20_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  VALID_STABLEPOOLS,
} from "utils/constants"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { useStableSDKPools } from "api/stableswap"
import { XykMath } from "@galacticcouncil/sdk"
import { useOmnipoolVolumes, useStablepoolVolumes } from "api/volume"
import BN from "bignumber.js"
import { useXYKConsts, useXYKSDKPools } from "api/xyk"
import { useXYKPoolTradeVolumes } from "./pool/details/PoolDetails.utils"
import { scaleHuman } from "utils/balance"
import { useAccountAssets } from "api/deposits"
import { TShareToken, useAssets } from "providers/assets"
import { getTradabilityFromBits } from "api/omnipool"
import { useOmnipoolFarms, useXYKFarms } from "api/farms"
import { useAssetsPrice } from "state/displayPrice"
import { useTotalIssuances } from "api/totalIssuance"
import { useBorrowAssetApy } from "api/borrow"
import {
  setOmnipoolTvlTotal,
  setOmnipoolVolumeTotal,
  setXykTvlTotal,
  setXykVolumeTotal,
  useOmnipoolTvlTotal,
  useOmnipoolVolumeTotal,
  useValidXYKPoolAddresses,
  useXykTvlTotal,
  useXykVolumeTotal,
} from "state/store"
import { useShallow } from "hooks/useShallow"
import { useAllOmnipoolDeposits } from "./farms/position/FarmingPosition.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const isXYKPoolType = (pool: TAnyPool): pool is TXYKPool =>
  !!(pool as TXYKPool).shareTokenIssuance

export const isStablepoolType = (pool: TAnyPool): pool is TStablepool =>
  !!(pool as TStablepool).reserves

export type TPool = NonNullable<ReturnType<typeof usePools>["data"]>[number]
export type TStablePoolDetails = NonNullable<
  ReturnType<typeof useStableSwapReserves>["data"]
>
export type TStablepool = TPool & TStablePoolDetails
export type TXYKPool = NonNullable<
  ReturnType<typeof useXYKPools>["data"]
>[number]

export type TAnyPool = TPool | TStablepool | TXYKPool

const GASSETS = [GDOT_STABLESWAP_ASSET_ID, GETH_STABLESWAP_ASSET_ID]

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

  const isLoading = isPoolsLoading || isLoadingPrices

  const { data: volumes, isLoading: isVolumeLoading } =
    useStablepoolVolumes(isLoading)

  const data = useMemo(() => {
    if (isLoading || !filteredStablepools.length) return []

    return filteredStablepools.map((filteredStablepool) => {
      const isGDOT = GDOT_STABLESWAP_ASSET_ID === filteredStablepool.id
      const meta = getAssetWithFallback(filteredStablepool.id)
      const metaOverride = isGDOT
        ? getAssetWithFallback(GDOT_ERC20_ASSET_ID)
        : undefined

      const accountAsset = accountAssets?.accountAssetsMap.get(
        isGDOT ? GDOT_ERC20_ASSET_ID : filteredStablepool.id,
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

      const fee = isGDOT ? BN(borrow.totalSupplyApy) : BN_NAN

      const name = metaOverride?.name || meta.name
      const symbol = metaOverride?.symbol || meta.symbol
      const iconId = metaOverride?.iconId || meta.iconId

      return {
        id: filteredStablepool.id,
        poolId: filteredStablepool.id,
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
        isGDOT,
        isGETH: false,
        isStablePool: isGDOT,
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
  //const { data: accountAssets } = useAccountAssets()

  // const { data: stablepools, isLoading: isLoadingStablepools } =
  //   useStablepools()

  // const assetsId = useMemo(
  //   () => omnipoolAssets.data?.map((a) => a.id) ?? [],
  //   [omnipoolAssets.data],
  // )

  // const { data: allFarms, isLoading: isAllFarmsLoading } =
  //   useOmnipoolFarms(assetsId)

  // const { isLoading, getAssetPrice } = useAssetsPrice(assetsId)

  // const isInitialLoading =
  //   omnipoolAssets.isLoading || isLoading || isLoadingStablepools

  // const { data: volumes, isLoading: isVolumeLoading } =
  //   useOmnipoolVolumes(isInitialLoading)
  // const { data: omnipoolMetrics = [], isLoading: isOmnipoolMetricsLoading } =
  //   useOmnipoolYieldMetrics(isInitialLoading)

  // const isTotalFeeLoading = isOmnipoolMetricsLoading || isAllFarmsLoading

  // const { data, tvlTotal, volumeTotal } = useMemo(() => {
  //   let volumeTotal = BN_0
  //   let tvlTotal = BN_0

  //   if (!omnipoolAssets.data || isLoading)
  //     return { data: undefined, volumeTotal, tvlTotal }

  //   const rows = omnipoolAssets.data.map((asset) => {
  //     const isGETH = asset.id === GETH_ERC20_ASSET_ID
  //     const poolId = isGETH ? GETH_STABLESWAP_ASSET_ID : asset.id
  //     const meta = getAssetWithFallback(asset.id)
  //     const accountAsset = accountAssets?.accountAssetsMap.get(asset.id)

  //     const spotPrice = getAssetPrice(asset.id).price
  //     const tradability = getTradabilityFromBits(asset.bits ?? 0)

  //     const tvlDisplay = BN(asset.balance)
  //       .times(spotPrice)
  //       .shiftedBy(-meta.decimals)

  //     const volumeRaw = volumes?.find(
  //       (volume) => volume.assetId === asset.id,
  //     )?.assetVolume

  //     const volume =
  //       volumeRaw && spotPrice
  //         ? BN(volumeRaw)
  //             .shiftedBy(-meta.decimals)
  //             .multipliedBy(spotPrice)
  //             .toString()
  //         : undefined

  //     if (!tvlDisplay.isNaN()) {
  //       tvlTotal = tvlTotal.plus(tvlDisplay)
  //     }

  //     if (volume) {
  //       volumeTotal = volumeTotal.plus(volume)
  //     }

  //     const { totalApr, farms = [] } = allFarms?.get(asset.id) ?? {}

  //     const fee =
  //       native.id === asset.id
  //         ? BN_0
  //         : BN(
  //             omnipoolMetrics.find(
  //               (omnipoolMetric) => omnipoolMetric.assetId === asset.id,
  //             )?.projectedAprPerc ?? BN_NAN,
  //           )

  //     const totalFee = !isTotalFeeLoading ? fee.plus(totalApr ?? 0) : BN_NAN

  //     const filteredOmnipoolPositions = accountAsset?.liquidityPositions ?? []
  //     const filteredMiningPositions = accountAsset?.omnipoolDeposits ?? []
  //     const isPositions = !!accountAsset?.isPoolPositions

  //     return {
  //       id: asset.id,
  //       poolId,
  //       name: meta.name,
  //       symbol: meta.symbol,
  //       meta: isGETH
  //         ? {
  //             ...meta,
  //             meta: getAssetWithFallback(GETH_STABLESWAP_ASSET_ID).meta,
  //           }
  //         : meta,
  //       tvlDisplay,
  //       spotPrice: spotPrice,
  //       canAddLiquidity: tradability.canAddLiquidity,
  //       canRemoveLiquidity: tradability.canRemoveLiquidity,
  //       volume,
  //       isVolumeLoading: isVolumeLoading,
  //       farms: farms.filter((farm) => farm.isActive && BN(farm.apr).gt(0)),
  //       allFarms: farms.filter((farm) =>
  //         farm.isActive ? BN(farm.apr).gt(0) : true,
  //       ),
  //       fee,
  //       totalFee,
  //       isFeeLoading: isTotalFeeLoading,
  //       omnipoolPositions: filteredOmnipoolPositions,
  //       miningPositions: filteredMiningPositions,
  //       balance: accountAsset?.balance,
  //       isPositions,
  //       isGDOT: false,
  //       isGETH,
  //       isStablePool: meta.isStableSwap || isGETH,
  //     }
  //   })

  //   return { data: rows, tvlTotal, volumeTotal }
  // }, [
  //   omnipoolAssets.data,
  //   native.id,
  //   accountAssets,
  //   getAssetWithFallback,
  //   allFarms,
  //   volumes,
  //   getAssetPrice,
  //   isLoading,
  //   isTotalFeeLoading,
  //   isVolumeLoading,
  //   omnipoolMetrics,
  // ])

  // const sortedData = useMemo(() => {
  //   return data
  //     ? [...data, ...stablepools].sort((poolA, poolB) => {
  //         if (poolA.id === NATIVE_ASSET_ID) {
  //           return -1
  //         }

  //         if (poolB.poolId === NATIVE_ASSET_ID) {
  //           return 1
  //         }

  //         if (GASSETS.includes(poolA.poolId)) {
  //           return -1
  //         }

  //         if (GASSETS.includes(poolB.poolId)) {
  //           return 1
  //         }

  //         return poolA.tvlDisplay.gt(poolB.tvlDisplay) ? -1 : 1
  //       })
  //     : undefined
  // }, [data, stablepools])

  // if (!tvlTotal.isZero()) {
  //   setOmnipoolTvlTotal(tvlTotal.toFixed(0))
  // }

  // if (!volumeTotal.isZero()) {
  //   setOmnipoolVolumeTotal(volumeTotal.toFixed(0))
  // }

  return { data: [], isLoading: false }

  // return {
  //   data: sortedData,
  //   isLoading: isInitialLoading,
  // }
}

export const useXYKPools = () => {
  const { data: xykConsts } = useXYKConsts()
  const { shareTokens } = useAssets()
  const addresses = useValidXYKPoolAddresses(
    useShallow((state) => state.addresses),
  )

  return { data: [], isLoading: false }
}

// export const useXYKPools = () => {
//   const { data: xykConsts } = useXYKConsts()
//   const { shareTokens } = useAssets()
//   const { data: accountAssets } = useAccountAssets()
//   const addresses = useValidXYKPoolAddresses(
//     useShallow((state) => state.addresses),
//   )

//   const { validShareTokens, allShareTokens } = useMemo(() => {
//     return shareTokens.reduce<{
//       allShareTokens: Array<TShareToken & { isInvalid: boolean }>
//       validShareTokens: Array<TShareToken>
//     }>(
//       (acc, shareToken) => {
//         const isInvalid = !addresses?.includes(shareToken.poolAddress)

//         if (!isInvalid) acc.validShareTokens.push(shareToken)

//         acc.allShareTokens.push({ ...shareToken, isInvalid })
//         return acc
//       },
//       {
//         allShareTokens: [],
//         validShareTokens: [],
//       },
//     )
//   }, [shareTokens, addresses])
//   const { data: allFarms, isLoading: isLoadingAllFarms } = useXYKFarms(
//     addresses ?? [],
//   )

//   const shareTokensId =
//     validShareTokens.map((shareToken) => shareToken.id) ?? []

//   const { data: totalIssuances, isInitialLoading: isIssuanceLoading } =
//     useTotalIssuances()

//   const shareTokeSpotPrices = useDisplayShareTokenPrice(shareTokensId)

//   const fee = xykConsts?.fee ? getTradeFee(xykConsts.fee) : BN_NAN

//   const isInitialLoading =
//     isIssuanceLoading || shareTokeSpotPrices.isInitialLoading

//   const { data: volumes, isLoading: isVolumeLoading } =
//     useXYKPoolTradeVolumes(isInitialLoading)

//   const { data, volumeTotal, tvlTotal } = useMemo(() => {
//     let volumeTotal = BN_0
//     let tvlTotal = BN_0

//     if (!shareTokeSpotPrices.data || !totalIssuances)
//       return { data: undefined, volumeTotal, tvlTotal }

//     const data = allShareTokens
//       .map((shareToken) => {
//         const accountAsset = accountAssets?.accountAssetsMap.get(shareToken.id)
//         const balance = accountAsset?.balance

//         const { id: shareTokenId, poolAddress, isInvalid } = shareToken

//         const issuance = totalIssuances.get(shareTokenId)

//         const shareTokenSpotPrice = shareTokeSpotPrices.data.find(
//           (shareTokeSpotPrice) => shareTokeSpotPrice.tokenIn === shareTokenId,
//         )

//         const myPoolShare =
//           balance && issuance
//             ? BN(balance.total).div(issuance).multipliedBy(100)
//             : undefined

//         const tvlDisplay =
//           issuance
//             ?.shiftedBy(-shareToken.decimals)
//             ?.multipliedBy(shareTokenSpotPrice?.spotPrice ?? BN_NAN) ?? BN_NAN

//         const volume = volumes?.find(
//           (volume) => volume.poolAddress === poolAddress,
//         )?.volume

//         const isFeeLoading = isLoadingAllFarms
//         const { totalApr, farms = [] } =
//           allFarms?.get(shareToken.poolAddress) ?? {}
//         const totalFee = !isFeeLoading ? fee.plus(totalApr ?? 0) : BN_NAN

//         const miningPositions = accountAsset?.xykDeposits ?? []
//         const isPositions = !!accountAsset?.isPoolPositions

//         if (!isInvalid) {
//           if (!tvlDisplay.isNaN()) {
//             tvlTotal = tvlTotal.plus(tvlDisplay)
//           }

//           if (volume && !BN(volume).isNaN()) {
//             volumeTotal = volumeTotal.plus(volume)
//           }
//         }

//         return {
//           id: shareToken.id,
//           poolId: poolAddress,
//           symbol: shareToken.symbol,
//           name: shareToken.name,
//           iconId: shareToken.iconId,
//           meta: shareToken,
//           tvlDisplay,
//           spotPrice: shareTokenSpotPrice?.spotPrice,
//           fee,
//           isXykPool: true,
//           poolAddress,
//           canAddLiquidity: true,
//           canRemoveLiquidity: true,
//           shareTokenIssuance: { totalShare: issuance, myPoolShare },
//           volume,
//           isVolumeLoading,
//           miningPositions,
//           isInvalid,
//           balance,
//           isPositions,
//           totalFee,
//           farms: farms.filter((farm) => farm.isActive && BN(farm.apr).gt(0)),
//           allFarms: farms.filter((farm) =>
//             farm.isActive ? BN(farm.apr).gt(0) : true,
//           ),
//           isFeeLoading,
//           isStablePool: false,
//         }
//       })
//       .sort((a, b) => {
//         if (a.isInvalid) return 1
//         if (b.isInvalid) return -1

//         if (a.tvlDisplay.isNaN()) return 1
//         if (b.tvlDisplay.isNaN()) return -1

//         return b.tvlDisplay.minus(a.tvlDisplay).toNumber()
//       })

//     return { data, volumeTotal, tvlTotal }
//   }, [
//     shareTokeSpotPrices.data,
//     totalIssuances,
//     allShareTokens,
//     accountAssets?.accountAssetsMap,
//     volumes,
//     isLoadingAllFarms,
//     allFarms,
//     fee,
//     isVolumeLoading,
//   ])

//   if (!tvlTotal.isZero()) {
//     setXykTvlTotal(tvlTotal.toFixed(0))
//   }

//   if (!volumeTotal.isZero()) {
//     setXykVolumeTotal(volumeTotal.toFixed(0))
//   }

//   return { data, isInitialLoading }
// }

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
  const tvl = useOmnipoolTvlTotal((state) => state.tvl)
  const volume = useOmnipoolVolumeTotal((state) => state.volume)

  return {
    tvl,
    volume,
    isLoading: !tvl || !volume,
  }
}

export const useXykTotals = () => {
  const tvl = useXykTvlTotal((state) => state.tvl)
  const volume = useXykVolumeTotal((state) => state.volume)

  return {
    tvl,
    volume,
    isLoading: !tvl || !volume,
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

        if (token.type === "Token" || token.type === "Erc20") {
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
      .plus(BN(pool.volume ?? 0))
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

export const useStableSwapReserves = (poolId: string) => {
  const { data: stablePools = [], isLoading } = useStableSDKPools()

  const stablePoolBalance =
    stablePools
      .find((stablePool) => stablePool.id === poolId)
      ?.tokens.filter(
        (token) => token.type === "Token" || token.type === "Erc20",
      ) ?? []

  const reserves = stablePoolBalance.map((token) => {
    const id = token.id

    return {
      asset_id: Number(id),
      decimals: token.decimals,
      symbol: token.symbol,
      amount: token.balance,
    }
  })

  const assetIds = stablePoolBalance.map((token) => token.id)
  const { getAssetPrice, isLoading: isPricesLoading } = useAssetsPrice(assetIds)

  const assetBalances = useMemo(
    () =>
      reserves.map((reserve) => {
        const id = reserve.asset_id.toString()
        const spotPrice = getAssetPrice(id).price
        const balance = BN(reserve.amount).shiftedBy(-reserve.decimals)

        return {
          id,
          symbol: reserve.symbol,
          balance: balance.toString(),
          balanceDisplay: balance.multipliedBy(spotPrice).toString(),
        }
      }),
    [reserves, getAssetPrice],
  )

  const totalValue = assetBalances
    .reduce((t, asset) => t.plus(asset.balanceDisplay), BN_0)
    .toString()

  let smallestPercentage: undefined | { assetId: string; percentage: number }
  let biggestPercentage: undefined | { assetId: string; percentage: number }

  const balances = assetBalances.map((assetBalance) => {
    const percentage = BN(assetBalance.balanceDisplay)
      .div(totalValue)
      .times(100)
      .dp(1)
      .toNumber()

    if (!smallestPercentage || !biggestPercentage) {
      smallestPercentage = {
        assetId: assetBalance.id,
        percentage,
      }

      biggestPercentage = {
        assetId: assetBalance.id,
        percentage,
      }
    }

    if (smallestPercentage.percentage > percentage) {
      smallestPercentage = {
        assetId: assetBalance.id,
        percentage,
      }
    }

    if (biggestPercentage.percentage < percentage) {
      biggestPercentage = {
        assetId: assetBalance.id,
        percentage,
      }
    }

    return {
      ...assetBalance,
      percentage,
    }
  })

  return {
    data: { balances, reserves, smallestPercentage, biggestPercentage },
    isLoading: isLoading || isPricesLoading,
  }
}

export const useRejoinedFarms = (pool: TPool) => {
  const { account } = useAccount()
  const omnipoolDepositValues = useAllOmnipoolDeposits(account?.address)

  const { farms, miningPositions } = pool

  const depositValues = useMemo(
    () => omnipoolDepositValues[pool.id] ?? [],
    [omnipoolDepositValues, pool.id],
  )

  const avaialableFarms = useMemo(
    () =>
      miningPositions
        .map((position) => {
          const depositId = position.id
          const depositValue = depositValues.find(
            (depositValue) => depositValue.depositId === depositId,
          )
          return {
            farms: farms.filter(
              (farm) =>
                !position.data.yieldFarmEntries.some(
                  (entry) =>
                    BN(entry.globalFarmId).eq(farm.globalFarmId) &&
                    BN(entry.yieldFarmId).eq(farm.yieldFarmId),
                ),
            ),
            depositId,
            currentValue: depositValue?.totalValueShifted.toString(),
          }
        })
        .flat()
        .filter((farm) => farm.farms.length),
    [depositValues, farms, miningPositions],
  )

  return avaialableFarms
}
