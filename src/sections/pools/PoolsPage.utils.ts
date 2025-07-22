import {
  useOmnipoolYieldMetrics,
  useOmnipoolDataObserver,
  TOmnipoolAssetData,
} from "api/omnipool"
import { useEffect, useMemo } from "react"
import { NATIVE_ASSET_ID } from "utils/api"
import {
  BN_0,
  BN_1,
  BN_NAN,
  GDOT_ERC20_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  GETH_ERC20_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  USDT_POOL_ASSET_ID,
} from "utils/constants"
import { useDisplayShareTokenPrice } from "utils/displayAsset"
import { useStablepoolFees, useStableSDKPools } from "api/stableswap"
import { PoolToken, XykMath } from "@galacticcouncil/sdk"
import { useOmnipoolVolumes, useStablepoolVolumes } from "api/volume"
import BN from "bignumber.js"
import { useXYKConsts, useXYKSDKPools } from "api/xyk"
import { useXYKPoolTradeVolumes } from "./pool/details/PoolDetails.utils"
import { scaleHuman } from "utils/balance"
import { useAccountBalances, useAccountPositions } from "api/deposits"
import { TShareToken, useAssets } from "providers/assets"
import { getTradabilityFromBits } from "api/omnipool"
import { useOmnipoolFarms, useXYKFarms } from "api/farms"
import { useAssetsPrice } from "state/displayPrice"
import { useTotalIssuances } from "api/totalIssuance"
import { useBorrowAssetApy } from "api/borrow"
import {
  setOmnipoolTvlTotal,
  setOmnipoolVolumeTotal,
  setStablepoolTvlTotal,
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

type TStablepoolData = {
  poolId: string
  id: string
  volume: string
  balance: string
  isStablepoolData: boolean
  lpFee: string | undefined
}

const isStablepoolData = (
  pool: TStablepoolData | TOmnipoolAssetData,
): pool is TStablepoolData => !!(pool as TStablepoolData).isStablepoolData

export type TAnyPool = TPool | TStablepool | TXYKPool

const GASSETS = [GDOT_STABLESWAP_ASSET_ID, GETH_STABLESWAP_ASSET_ID]

const getTradeFee = (fee: string[]) => {
  if (fee?.length !== 2) return BN_NAN

  const numerator = new BN(fee[0])
  const denominator = new BN(fee[1])
  const tradeFee = numerator.div(denominator)

  return tradeFee.times(100)
}

export const usePools = () => {
  const { native, getAssetWithFallback } = useAssets()

  const { data: omnipoolAssets, isLoading: isOmnipoolAssetLoading } =
    useOmnipoolDataObserver()
  const { data: accountAssets } = useAccountBalances()
  const { data: accountPositions } = useAccountPositions()
  const { data: stablepoolData } = useStablepoolsData()

  const omnipoolAssetsId = useMemo(
    () => omnipoolAssets?.map((a) => a.id) ?? [],
    [omnipoolAssets],
  )

  const stablepoolAssetsId = useMemo(
    () => stablepoolData?.map((a) => a.id) ?? [],
    [stablepoolData],
  )

  const { data: allFarms, isLoading: isAllFarmsLoading } =
    useOmnipoolFarms(omnipoolAssetsId)

  const { isLoading, getAssetPrice } = useAssetsPrice([
    ...omnipoolAssetsId,
    ...stablepoolAssetsId,
  ])

  const isInitialLoading = isOmnipoolAssetLoading || isLoading

  const { data: volumes, isLoading: isVolumeLoading } =
    useOmnipoolVolumes(isInitialLoading)
  const { data: omnipoolMetrics = [], isLoading: isOmnipoolMetricsLoading } =
    useOmnipoolYieldMetrics(isInitialLoading)

  const gdotBorrowApy = useBorrowAssetApy(GDOT_STABLESWAP_ASSET_ID)
  const gethBorrowApy = useBorrowAssetApy(GETH_STABLESWAP_ASSET_ID)
  const usdtBorrowApy = useBorrowAssetApy(USDT_POOL_ASSET_ID)

  const isTotalFeeLoading = isOmnipoolMetricsLoading || isAllFarmsLoading

  const { data, tvlTotal, volumeTotal, stablepoolTotal } = useMemo(() => {
    let volumeTotal = BN_0
    let tvlTotal = BN_0
    let stablepoolTotal = BN_0

    if (!omnipoolAssets || isLoading || !stablepoolData)
      return { data: undefined, volumeTotal, tvlTotal, stablepoolTotal }

    const onlyStablepool: TStablepoolData[] = []
    const stableInOmnipool: Map<string, TStablepoolData> = new Map()

    stablepoolData.forEach((stablepoolData) => {
      if (stablepoolData.balance) {
        stablepoolTotal = stablepoolTotal.plus(stablepoolData.balance)
      }

      if (
        !omnipoolAssets?.find((pool) => pool.id === stablepoolData.id) &&
        stablepoolData.id !== GETH_STABLESWAP_ASSET_ID
      ) {
        onlyStablepool.push(stablepoolData)
      } else {
        stableInOmnipool.set(stablepoolData.id, stablepoolData)
      }
    })

    const rows = [...omnipoolAssets, ...onlyStablepool]
      .map((asset) => {
        const isGETH = asset.id === GETH_ERC20_ASSET_ID
        const isGDOT = asset.id === GDOT_STABLESWAP_ASSET_ID
        const poolId = isGETH ? GETH_STABLESWAP_ASSET_ID : asset.id

        const isStablepoolOnly = isStablepoolData(asset)
        const isStableInOmnipool = stableInOmnipool.get(poolId)

        const meta = getAssetWithFallback(asset.id)

        const accountAsset = accountAssets?.accountAssetsMap.get(asset.id)
        const positions = accountPositions?.accountAssetsMap.get(asset.id)

        const spotPrice = getAssetPrice(asset.id).price
        const tradability =
          !isStablepoolOnly && asset.bits
            ? getTradabilityFromBits(asset.bits)
            : { canAddLiquidity: false, canRemoveLiquidity: true }

        const tvlDisplay = isStablepoolOnly
          ? BN(asset.balance)
          : BN(asset.balance).times(spotPrice).shiftedBy(-meta.decimals)

        let volume: string | undefined

        if (isStablepoolOnly) {
          volume = asset.volume
        } else {
          const stablepoolVolume = isStableInOmnipool?.volume

          const volumeRaw = volumes?.find(
            (volume) => volume.assetId === asset.id,
          )?.assetVolume

          const omnipoolVolume =
            volumeRaw && spotPrice
              ? BN(volumeRaw)
                  .shiftedBy(-meta.decimals)
                  .multipliedBy(spotPrice)
                  .toString()
              : undefined

          volume = stablepoolVolume
            ? BN(stablepoolVolume)
                .plus(omnipoolVolume ?? 0)
                .toString()
            : omnipoolVolume
        }

        if (!tvlDisplay.isNaN() && !isStablepoolOnly) {
          tvlTotal = tvlTotal.plus(tvlDisplay)
        }

        if (volume) {
          volumeTotal = volumeTotal.plus(volume)
        }

        const { totalApr: farmsApr, farms = [] } = allFarms?.get(asset.id) ?? {}

        let lpFeeOmnipool: string | undefined
        let lpFeeStablepool: string | undefined
        let totalFee: BN | undefined

        if (isStablepoolOnly) {
          lpFeeStablepool = asset.lpFee

          if (isGDOT) {
            totalFee = BN(gdotBorrowApy.totalSupplyApy)
          } else if (poolId === USDT_POOL_ASSET_ID) {
            totalFee = BN(lpFeeStablepool ?? 0).plus(
              usdtBorrowApy.totalSupplyApy,
            )
          } else {
            totalFee = BN(lpFeeStablepool ?? 0).plus(farmsApr ?? 0)
          }
        } else if (isStableInOmnipool) {
          lpFeeStablepool = isStableInOmnipool.lpFee ?? "0"

          lpFeeOmnipool =
            omnipoolMetrics.find(({ assetId, assetRegistryId }) => {
              const id = assetRegistryId ?? assetId

              return id === asset.id
            })?.projectedAprPerc ?? "0"

          if (isGETH) {
            totalFee = BN(lpFeeOmnipool ?? 0)
              .plus(gethBorrowApy.totalSupplyApy)
              .plus(farmsApr ?? 0)
          } else {
            totalFee = BN(lpFeeStablepool)
              .plus(lpFeeOmnipool ?? 0)
              .plus(farmsApr ?? 0)
          }
        } else if (!isStablepoolOnly && asset.id !== native.id) {
          lpFeeOmnipool =
            omnipoolMetrics.find(({ assetId, assetRegistryId }) => {
              const id = assetRegistryId ?? assetId

              return id === asset.id
            })?.projectedAprPerc ?? "0"

          totalFee = BN(lpFeeOmnipool ?? 0).plus(farmsApr ?? 0)
        }

        const filteredOmnipoolPositions = positions?.liquidityPositions ?? []
        const filteredMiningPositions = positions?.omnipoolDeposits ?? []
        const isPositions =
          !!positions?.isPoolPositions || !!accountAsset?.isPoolPositions

        const metaOverride = isGDOT
          ? getAssetWithFallback(GDOT_ERC20_ASSET_ID)
          : undefined

        const name = metaOverride?.name || meta.name
        const symbol = metaOverride?.symbol || meta.symbol
        const iconId = metaOverride?.iconId || meta.iconId

        return {
          id: asset.id,
          poolId,
          name,
          symbol,
          meta: isGDOT
            ? {
                ...meta,
                name,
                symbol,
                iconId,
              }
            : meta,
          tvlDisplay,
          spotPrice,
          canAddLiquidity: tradability.canAddLiquidity,
          canRemoveLiquidity: tradability.canRemoveLiquidity,
          volume,
          isVolumeLoading: isVolumeLoading,
          farms: farms.filter((farm) => farm.isActive && BN(farm.apr).gt(0)),
          allFarms: farms.filter((farm) =>
            farm.isActive ? BN(farm.apr).gt(0) : true,
          ),
          totalFee: totalFee ?? BN_NAN,
          lpFeeOmnipool,
          lpFeeStablepool,
          isFeeLoading: isTotalFeeLoading,
          omnipoolPositions: filteredOmnipoolPositions,
          miningPositions: filteredMiningPositions,
          balance: accountAsset?.balance,
          isPositions,
          isGDOT,
          isGETH,
          isStablePool: isStablepoolOnly || !!isStableInOmnipool,
          isInOmnipool: !isStablepoolOnly,
        }
      })
      .sort((poolA, poolB) => {
        if (poolA.poolId === NATIVE_ASSET_ID) {
          return -1
        }

        if (poolB.poolId === NATIVE_ASSET_ID) {
          return 1
        }

        if (GASSETS.includes(poolA.poolId)) {
          return -1
        }

        if (GASSETS.includes(poolB.poolId)) {
          return 1
        }

        return poolA.tvlDisplay.gt(poolB.tvlDisplay) ? -1 : 1
      })

    return { data: rows, tvlTotal, volumeTotal, stablepoolTotal }
  }, [
    omnipoolAssets,
    native.id,
    accountAssets,
    getAssetWithFallback,
    allFarms,
    volumes,
    getAssetPrice,
    isLoading,
    isTotalFeeLoading,
    isVolumeLoading,
    omnipoolMetrics,
    stablepoolData,
    gdotBorrowApy.totalSupplyApy,
    gethBorrowApy.totalSupplyApy,
    accountPositions,
    usdtBorrowApy.totalSupplyApy,
  ])

  useEffect(() => {
    if (!tvlTotal.isZero()) {
      setOmnipoolTvlTotal(tvlTotal.toFixed(0))
    }
  }, [tvlTotal])

  useEffect(() => {
    if (!volumeTotal.isZero()) {
      setOmnipoolVolumeTotal(volumeTotal.toFixed(0))
    }
  }, [volumeTotal])

  useEffect(() => {
    if (!stablepoolTotal.isZero()) {
      setStablepoolTvlTotal(stablepoolTotal.toFixed(0))
    }
  }, [stablepoolTotal])

  return {
    data,
    isLoading: isInitialLoading,
  }
}

export const useXYKPools = () => {
  const { data: xykConsts } = useXYKConsts()
  const { shareTokens } = useAssets()
  const { data: accountAssets } = useAccountBalances()
  const { data: accountPositions } = useAccountPositions()

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

  const isInitialLoading =
    isIssuanceLoading || shareTokeSpotPrices.isInitialLoading

  const { data: volumes, isLoading: isVolumeLoading } =
    useXYKPoolTradeVolumes(isInitialLoading)

  const { data, volumeTotal, tvlTotal } = useMemo(() => {
    let volumeTotal = BN_0
    let tvlTotal = BN_0

    if (!shareTokeSpotPrices.data || !totalIssuances)
      return { data: undefined, volumeTotal, tvlTotal }

    const data = allShareTokens
      .map((shareToken) => {
        const accountAsset = accountAssets?.accountAssetsMap.get(shareToken.id)
        const positions = accountPositions?.accountAssetsMap.get(
          shareToken.poolAddress,
        )
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

        const miningPositions = positions?.xykDeposits ?? []
        const isPositions =
          !!positions?.isPoolPositions || !!accountAsset?.isPoolPositions

        if (!isInvalid) {
          if (!tvlDisplay.isNaN()) {
            tvlTotal = tvlTotal.plus(tvlDisplay)
          }

          if (volume && !BN(volume).isNaN()) {
            volumeTotal = volumeTotal.plus(volume)
          }
        }

        return {
          id: shareToken.id,
          poolId: poolAddress,
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
          isStablePool: false,
          isInOmnipool: false,
        }
      })
      .sort((a, b) => {
        if (a.isInvalid) return 1
        if (b.isInvalid) return -1

        if (a.tvlDisplay.isNaN()) return 1
        if (b.tvlDisplay.isNaN()) return -1

        return b.tvlDisplay.minus(a.tvlDisplay).toNumber()
      })

    return { data, volumeTotal, tvlTotal }
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
    accountPositions,
  ])

  useEffect(() => {
    if (!tvlTotal.isZero()) {
      setXykTvlTotal(tvlTotal.toFixed(0))
    }
  }, [tvlTotal])

  useEffect(() => {
    if (!volumeTotal.isZero()) {
      setXykVolumeTotal(volumeTotal.toFixed(0))
    }
  }, [volumeTotal])

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
  usePools()
  const tvl = useOmnipoolTvlTotal((state) => state.tvl)
  const volume = useOmnipoolVolumeTotal((state) => state.volume)

  return {
    tvl,
    volume,
    isLoading: !tvl || !volume,
  }
}

export const useXykTotals = () => {
  useXYKPools()
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

export const useStablepoolsData = (disabled?: boolean) => {
  const { data: volumes, isLoading: isVolumeLoading } =
    useStablepoolVolumes(disabled)

  const { data: stablePools, isLoading: isPoolLoading } = useStableSDKPools()
  const { data: stablepoolFees } = useStablepoolFees()

  const tokensSet = new Set<string>()

  const stablePoolData = stablePools?.map((stablePool) => {
    const filteredTokens: (PoolToken & { volume: string | undefined })[] = []
    const poolVolume = volumes?.find(
      (volume) => volume.poolId === stablePool.id,
    )?.volumes

    stablePool.tokens.forEach((token) => {
      if (token.type !== "StableSwap") {
        const volume = poolVolume?.find(
          (pool) => pool.assetId === token.id,
        )?.assetVolume

        tokensSet.add(token.id)
        filteredTokens.push({ ...token, volume })
      }
    })
    return { poolId: stablePool.id, tokens: filteredTokens }
  })

  const { isLoading, getAssetPrice } = useAssetsPrice([...tokensSet])

  const data = stablePoolData?.map((stablepool) => {
    let totalVolume = BN_0
    let totalBalance = BN_0

    const poolId = stablepool.poolId
    const id = poolId

    stablepool.tokens.forEach((token) => {
      const assetPrice = BN(getAssetPrice(token.id).price)

      const displayVolume = BN(token.volume ?? 0)
        .shiftedBy(-token.decimals)
        .times(assetPrice)

      const displayBalance = BN(token.balance ?? 0)
        .shiftedBy(-token.decimals)
        .times(assetPrice)

      if (!displayVolume.isNaN()) totalVolume = totalVolume.plus(displayVolume)
      if (!displayBalance.isNaN())
        totalBalance = totalBalance.plus(displayBalance)
    })

    const lpFee = stablepoolFees?.find(
      (stablepoolFee) => stablepoolFee.poolId === poolId,
    )?.projectedApyPerc

    const data: TStablepoolData = {
      poolId,
      id,
      volume: totalVolume.toString(),
      balance: totalBalance.toString(),
      isStablepoolData: true,
      lpFee,
    }

    return data
  })

  return { data, isLoading: isLoading || isVolumeLoading || isPoolLoading }
}
