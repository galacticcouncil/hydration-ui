import {
  ProtocolAction,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@aave/contract-helpers"
import {
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
} from "@aave/math-utils"
import { useQuery } from "@tanstack/react-query"
import { isPaseoRpcUrl, isTestnetRpcUrl } from "api/provider"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import {
  ComputedReserveData,
  ExtendedFormattedUser,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import {
  formatReserveIncentives,
  reserveSortFn,
} from "sections/lending/store/poolSelectors"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "sections/lending/ui-config/addresses"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"
import {
  calculateHFAfterSupply,
  calculateHFAfterSwap,
  calculateHFAfterWithdraw,
} from "sections/lending/utils/hfUtils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getAddressFromAssetId, getAssetIdFromAddress, H160 } from "utils/evm"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { useAssets } from "providers/assets"
import { calculateMaxWithdrawAmount } from "sections/lending/components/transactions/Withdraw/utils"
import { HEALTH_FACTOR_RISK_THRESHOLD } from "sections/lending/ui-config/misc"
import {
  GETH_ERC20_ASSET_ID,
  VDOT_ASSET_ID,
  WSTETH_ASSET_ID,
} from "utils/constants"
import { useBifrostVDotApy } from "api/external/bifrost"
import { useStablepoolFees } from "./stableswap"
import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import { useLIDOEthAPR } from "./external/ethereum"
import { TFarmAprData, useOmnipoolFarm } from "./farms"

export const useBorrowContractAddresses = () => {
  const { isLoaded, evm } = useRpcProvider()

  return useMemo(() => {
    if (!isLoaded) return null
    if (isPaseoRpcUrl(evm.connection.url)) {
      return AaveV3HydrationMainnet
    }
    const isTestnet = isTestnetRpcUrl(evm.connection.url)
    return isTestnet ? AaveV3HydrationTestnet : AaveV3HydrationMainnet
  }, [evm, isLoaded])
}

export const useBorrowPoolDataContract = () => {
  const { evm } = useRpcProvider()
  const addresses = useBorrowContractAddresses()

  return useMemo(() => {
    if (!addresses) return null

    return new UiPoolDataProvider({
      uiPoolDataProviderAddress: addresses.UI_POOL_DATA_PROVIDER,
      provider: evm,
      chainId: parseFloat(import.meta.env.VITE_EVM_CHAIN_ID),
    })
  }, [addresses, evm])
}

export const useBorrowIncentivesContract = () => {
  const { evm } = useRpcProvider()
  const addresses = useBorrowContractAddresses()

  return useMemo(() => {
    if (!addresses) return null

    return new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress: addresses.UI_INCENTIVE_DATA_PROVIDER,
      provider: evm,
      chainId: parseFloat(import.meta.env.VITE_EVM_CHAIN_ID),
    })
  }, [addresses, evm])
}

export const useBorrowIncentives = () => {
  const incentivesContract = useBorrowIncentivesContract()
  const addresses = useBorrowContractAddresses()

  const lendingPoolAddressProvider = addresses?.POOL_ADDRESSES_PROVIDER ?? ""

  return useQuery(
    QUERY_KEYS.borrowIncentives(lendingPoolAddressProvider),
    async () => {
      if (!incentivesContract || !addresses) return null

      const incentives =
        await incentivesContract.getReservesIncentivesDataHumanized({
          lendingPoolAddressProvider,
        })

      return formatReserveIncentives(incentives)
    },
    {
      retry: false,
      enabled: !!lendingPoolAddressProvider && !!incentivesContract,
    },
  )
}

export const useBorrowUserIncentives = (givenAddress?: string) => {
  const incentivesContract = useBorrowIncentivesContract()
  const addresses = useBorrowContractAddresses()
  const { account } = useAccount()

  const address = givenAddress || account?.address || ""

  const evmAddress = H160.fromAny(address)

  const lendingPoolAddressProvider = addresses?.POOL_ADDRESSES_PROVIDER ?? ""

  return useQuery(
    QUERY_KEYS.borrowIncentives(lendingPoolAddressProvider, evmAddress),
    async () => {
      if (!incentivesContract || !evmAddress) return null

      return incentivesContract.getUserReservesIncentivesDataHumanized({
        lendingPoolAddressProvider,
        user: evmAddress,
      })
    },
    {
      retry: false,
      enabled:
        !!evmAddress && !!lendingPoolAddressProvider && !!incentivesContract,
    },
  )
}

export const useBorrowReserves = () => {
  const { api } = useRpcProvider()
  const poolDataContract = useBorrowPoolDataContract()
  const addresses = useBorrowContractAddresses()

  const { data: reserveIncentives, isSuccess: isIncentivesSuccess } =
    useBorrowIncentives()

  const lendingPoolAddressProvider = addresses?.POOL_ADDRESSES_PROVIDER ?? ""

  return useQuery(
    QUERY_KEYS.borrowReserves(lendingPoolAddressProvider),
    async () => {
      if (!poolDataContract) return null

      const [reserves, timestamp] = await Promise.all([
        poolDataContract.getReservesHumanized({
          lendingPoolAddressProvider,
        }),
        api.query.timestamp.now(),
      ])

      const { baseCurrencyData, reservesData } = reserves
      const currentTimestamp = timestamp.toNumber() / 1000

      const formattedReserves = formatReservesAndIncentives({
        currentTimestamp,
        reserves: reservesData,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        reserveIncentives: reserveIncentives ?? [],
      })
        .map((r) => ({
          ...r,
          ...fetchIconSymbolAndName(r),
          isEmodeEnabled: r.eModeCategoryId !== 0,
          isWrappedBaseAsset: false,
        }))
        .sort(reserveSortFn)

      return {
        formattedReserves,
        baseCurrencyData,
      }
    },
    {
      retry: false,
      enabled:
        !!lendingPoolAddressProvider &&
        !!poolDataContract &&
        isIncentivesSuccess,
    },
  )
}

export const useUserBorrowSummary = (givenAddress?: string) => {
  const { account } = useAccount()
  const { api, isLoaded } = useRpcProvider()
  const { data: reserves, isSuccess: isReservesSuccess } = useBorrowReserves()
  const { data: reserveIncentives, isSuccess: isIncentivesSuccess } =
    useBorrowIncentives()
  const { data: userIncentives } = useBorrowUserIncentives()

  const poolDataContract = useBorrowPoolDataContract()
  const addresses = useBorrowContractAddresses()

  const address = givenAddress || account?.address || ""
  const evmAddress = H160.fromAny(address)

  const lendingPoolAddressProvider = addresses?.POOL_ADDRESSES_PROVIDER ?? ""

  return useQuery(
    QUERY_KEYS.borrowUserSummary(evmAddress),
    async () => {
      if (!reserves || !poolDataContract) return null

      const [user, timestamp] = await Promise.all([
        poolDataContract.getUserReservesHumanized({
          lendingPoolAddressProvider,
          user: evmAddress,
        }),
        api.query.timestamp.now(),
      ])

      const { baseCurrencyData, formattedReserves } = reserves
      const { userEmodeCategoryId, userReserves } = user

      const currentTimestamp = timestamp.toNumber() / 1000

      const summary = formatUserSummaryAndIncentives({
        currentTimestamp,
        marketReferencePriceInUsd:
          reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves,
        formattedReserves,
        userEmodeCategoryId,
        reserveIncentives: reserveIncentives ?? [],
        userIncentives: userIncentives ?? [],
      })

      const extendedUser: ExtendedFormattedUser = {
        ...summary,
        isInEmode: userEmodeCategoryId !== 0,
        userEmodeCategoryId,
        // @TODO: calculate correct user APYs when we need to access them outside of MoneyMarket
        earnedAPY: 0,
        debtAPY: 0,
        netAPY: 0,
      }

      return extendedUser
    },
    {
      retry: false,
      enabled:
        isLoaded &&
        isReservesSuccess &&
        isIncentivesSuccess &&
        !!lendingPoolAddressProvider &&
        !!evmAddress,
    },
  )
}

export type UseHealthFactorChangeResult = {
  currentHealthFactor: string
  futureHealthFactor: string
  isHealthFactorBelowThreshold: boolean
} | null

export type UseHealthFactorChangeParams = {
  assetId: string
  amount: string
  action: ProtocolAction.supply | ProtocolAction.withdraw
  swapAsset?: {
    assetId: string
    amount: string
  }
}

export const useHealthFactorChange = ({
  assetId,
  amount,
  action,
  swapAsset,
}: UseHealthFactorChangeParams): UseHealthFactorChangeResult => {
  const { getErc20 } = useAssets()
  const { data: user } = useUserBorrowSummary()

  return useMemo(() => {
    if (!user) return null

    const underlyingAssetId = getErc20(assetId)?.underlyingAssetId

    if (!underlyingAssetId) return null

    if (swapAsset) {
      const swapUnderlyingAssetId = getErc20(
        swapAsset.assetId,
      )?.underlyingAssetId

      if (swapUnderlyingAssetId) {
        const isWithdrawPrimary = action === ProtocolAction.withdraw

        const withdrawAmount = isWithdrawPrimary ? amount : swapAsset.amount
        const withdrawAssetUnderlyingId = isWithdrawPrimary
          ? underlyingAssetId
          : swapUnderlyingAssetId

        const supplyAmount = isWithdrawPrimary ? swapAsset.amount : amount
        const supplyAssetUnderlyingId = isWithdrawPrimary
          ? swapUnderlyingAssetId
          : underlyingAssetId

        return getHealthFactorChangeAfterSwap(
          user,
          withdrawAmount,
          withdrawAssetUnderlyingId,
          supplyAmount,
          supplyAssetUnderlyingId,
        )
      }
    }

    return getHealthFactorChange(user, underlyingAssetId, amount, action)
  }, [action, amount, assetId, getErc20, swapAsset, user])
}

const getHealthFactorChange = (
  user: ExtendedFormattedUser,
  underlyingAssetId: string,
  amount: string,
  action: ProtocolAction.supply | ProtocolAction.withdraw,
): UseHealthFactorChangeResult => {
  const reserveAddress = getAddressFromAssetId(underlyingAssetId)
  const userReserve = user.userReservesData.find(
    ({ reserve }) => reserve.underlyingAsset === reserveAddress,
  )

  if (!userReserve) return null

  const currentHealthFactor = user.healthFactor
  const result =
    action === ProtocolAction.withdraw
      ? calculateHFAfterWithdraw({
          user,
          userReserve,
          poolReserve: userReserve.reserve,
          withdrawAmount: amount || "0",
        })
      : calculateHFAfterSupply({
          user,
          poolReserve: userReserve.reserve,
          supplyAmount: amount || "0",
        })

  const futureHealthFactor = result.toString()

  const isHealthFactorBelowThreshold =
    currentHealthFactor !== "-1" &&
    futureHealthFactor !== "-1" &&
    Number(futureHealthFactor) < HEALTH_FACTOR_RISK_THRESHOLD

  return {
    isHealthFactorBelowThreshold,
    currentHealthFactor,
    futureHealthFactor,
  }
}

export const getHealthFactorChangeAfterSwap = (
  user: ExtendedFormattedUser,
  fromAmount: string,
  fromAssetUnderlyingId: string,
  toAmount: string,
  toAssetUnderlyingId: string,
): UseHealthFactorChangeResult => {
  const fromAssetUserData = user.userReservesData.find(
    ({ reserve }) =>
      reserve.underlyingAsset === getAddressFromAssetId(fromAssetUnderlyingId),
  )

  const toAssetData = user.userReservesData.find(
    ({ reserve }) =>
      reserve.underlyingAsset === getAddressFromAssetId(toAssetUnderlyingId),
  )

  if (!fromAssetUserData || !toAssetData) return null

  const result = calculateHFAfterSwap({
    user,
    fromAmount: fromAmount,
    fromAssetData: fromAssetUserData.reserve,
    fromAssetUserData: fromAssetUserData,
    toAmountAfterSlippage: toAmount,
    toAssetData: toAssetData.reserve,
  })

  const futureHealthFactor = result.hfAfterSwap.isNaN()
    ? user.healthFactor
    : result.hfAfterSwap.toString()

  return {
    isHealthFactorBelowThreshold:
      futureHealthFactor !== "-1" &&
      Number(futureHealthFactor) < HEALTH_FACTOR_RISK_THRESHOLD,
    currentHealthFactor: user.healthFactor,
    futureHealthFactor,
  }
}

export const useBorrowMarketTotals = () => {
  const { data: reserves, isLoading } = useBorrowReserves()

  const borrowTotals = useMemo(() => {
    const defaultValues = {
      tvl: "0",
      debt: "0",
    }
    if (!reserves) return defaultValues

    return reserves.formattedReserves.reduce(
      (acc, reserve) => ({
        tvl: BN(acc.tvl).plus(reserve.totalLiquidityUSD).toString(),
        debt: BN(acc.debt).plus(reserve.totalDebtUSD).toString(),
      }),
      defaultValues,
    )
  }, [reserves])

  return {
    ...borrowTotals,
    isLoading,
  }
}

export const useMaxWithdrawAmount = (assetId: string) => {
  const { getErc20 } = useAssets()
  const underlyingAssetId = getErc20(assetId)?.underlyingAssetId

  const { data: user } = useUserBorrowSummary()

  return useMemo(() => {
    if (!underlyingAssetId || !user) return "0"

    const reserveAddress = getAddressFromAssetId(underlyingAssetId)
    const userReserve = user.userReservesData.find(
      ({ reserve }) => reserve.underlyingAsset === reserveAddress,
    )

    if (!userReserve) return "0"

    const maxAmountToWithdraw = calculateMaxWithdrawAmount(
      user,
      userReserve,
      userReserve.reserve,
    ).toString()

    return maxAmountToWithdraw
  }, [underlyingAssetId, user])
}

export type BorrowAssetApyData = {
  assetId: string
  tvl: string
  vDotApy?: number
  totalSupplyApy: number
  totalBorrowApy: number
  lpAPY: number
  incentivesNetAPR: number
  incentives: ReserveIncentiveResponse[]
  underlyingAssetsAPY: { supplyApy: number; borrowApy: number; id: string }[]
  farms: TFarmAprData[] | undefined
}

export const useMoneyMarketAssetsAPY = (assetIds: string[]) => {
  const { getAssetWithFallback, getErc20 } = useAssets()

  const { data: reserves } = useBorrowReserves()
  const { data: stablepoolFees } = useStablepoolFees()

  const aTokens = useMemo(() => {
    return assetIds.reduce<
      {
        assetId: string
        reserve: ComputedReserveData
        lpFee: number
        stableswapAssets: string[]
        isGETH: boolean
      }[]
    >((acc, assetId) => {
      const reserve = reserves?.formattedReserves.find(
        ({ underlyingAsset }) =>
          underlyingAsset === getAddressFromAssetId(assetId),
      )

      if (reserve) {
        const lpFee = Number(
          stablepoolFees?.find((fee) => fee.poolId === assetId)
            ?.projectedApyPerc ?? 0,
        )
        const meta = getAssetWithFallback(assetId)
        const stableswapAssets = meta.meta ? Object.keys(meta.meta) : []
        const isGETH = stableswapAssets.includes(WSTETH_ASSET_ID)

        acc.push({ assetId, reserve, lpFee, stableswapAssets, isGETH })
      }

      return acc
    }, [])
  }, [assetIds, getAssetWithFallback, reserves, stablepoolFees])

  const { data: vDotApy } = useBifrostVDotApy({
    enabled: aTokens.some((aToken) =>
      aToken.stableswapAssets.includes(VDOT_ASSET_ID),
    ),
  })

  const isGETH = aTokens.some((aToken) => aToken.isGETH)

  const { data: wsethApr } = useLIDOEthAPR({
    enabled: isGETH,
  })

  const { data: gethFarms } = useOmnipoolFarm(
    isGETH ? GETH_ERC20_ASSET_ID : undefined,
  )

  const data = useMemo<BorrowAssetApyData[]>(() => {
    return aTokens.map((aToken) => {
      const isWseth = aToken.stableswapAssets.includes(WSTETH_ASSET_ID)
      const assetsAmount = aToken.stableswapAssets.length

      const underlyingAssetIds = aToken.stableswapAssets.map((assetId) => {
        return getAddressFromAssetId(
          getErc20(assetId)?.underlyingAssetId ?? assetId,
        )
      })

      const underlyingReserves =
        reserves?.formattedReserves?.filter((reserve) => {
          return underlyingAssetIds.includes(reserve.underlyingAsset)
        }) ?? []

      const incentives = aToken.reserve.aIncentivesData ?? []

      const isIncentivesInfinity = incentives.some(
        (incentive) => !BN(incentive.incentiveAPR).isFinite(),
      )

      const incentivesAPRSum = isIncentivesInfinity
        ? Infinity
        : incentives.reduce(
            (aIncentive, bIncentive) => aIncentive + +bIncentive.incentiveAPR,
            0,
          ) * 100

      const incentivesNetAPR = isIncentivesInfinity
        ? Infinity
        : incentivesAPRSum !== Infinity
          ? incentivesAPRSum || 0
          : Infinity

      const underlyingAssetsAPY = underlyingReserves.map((reserve) => {
        const isVdot =
          reserve.underlyingAsset === getAddressFromAssetId(VDOT_ASSET_ID)

        const supplyAPY = isVdot
          ? BN(reserve.supplyAPY).plus(BN(vDotApy ?? 0).div(100))
          : BN(reserve.supplyAPY)

        const borrowAPY = isVdot
          ? BN(reserve.variableBorrowAPY).plus(BN(vDotApy ?? 0).div(100))
          : BN(reserve.variableBorrowAPY)

        return {
          supplyApy: supplyAPY.div(assetsAmount).times(100).toNumber(),
          borrowApy: borrowAPY.div(assetsAmount).times(100).toNumber(),
          id: getAssetIdFromAddress(reserve.underlyingAsset),
        }
      })

      if (isWseth) {
        underlyingAssetsAPY.push({
          id: WSTETH_ASSET_ID,
          supplyApy: BN(wsethApr ?? 0)
            .div(assetsAmount)
            .toNumber(),
          borrowApy: BN(wsethApr ?? 0)
            .div(assetsAmount)
            .toNumber(),
        })
      }

      const supplyAPYSum = underlyingAssetsAPY.reduce(
        (a, b) => a + b.supplyApy,
        0,
      )

      const borrowAPYSum = underlyingAssetsAPY.reduce(
        (a, b) => a + b.borrowApy,
        0,
      )
      const lpAPY = aToken.lpFee
      const totalApr = aToken.isGETH ? gethFarms?.totalApr : undefined
      const farms = aToken.isGETH ? gethFarms?.farms : undefined

      return {
        assetId: aToken.assetId,
        tvl: aToken.reserve?.totalLiquidityUSD || "0",
        totalSupplyApy: isIncentivesInfinity
          ? Infinity
          : supplyAPYSum + incentivesNetAPR + lpAPY + Number(totalApr ?? 0),
        totalBorrowApy: borrowAPYSum + incentivesNetAPR + lpAPY,
        lpAPY: lpAPY,
        underlyingAssetsAPY,
        incentivesNetAPR,
        incentives: aToken.reserve?.aIncentivesData ?? [],
        vDotApy,
        farms,
      }
    })
  }, [
    aTokens,
    getErc20,
    reserves?.formattedReserves,
    vDotApy,
    wsethApr,
    gethFarms,
  ])

  return data
}

export const useBorrowAssetApy = (
  assetId: string,
  withFarms: boolean | undefined = false,
): BorrowAssetApyData => {
  const { getAsset, getErc20 } = useAssets()
  const { data } = useBorrowReserves()

  const reserves = useMemo(() => data?.formattedReserves ?? [], [data])

  const asset = getAsset(assetId)

  const assetReserve = reserves.find(
    ({ underlyingAsset }) => underlyingAsset === getAddressFromAssetId(assetId),
  )

  const assetIds = useMemo(
    () =>
      asset?.isStableSwap && asset.meta ? Object.keys(asset.meta) : [assetId],
    [asset, assetId],
  )
  const assetsAmount = assetIds.length
  const isGETH = assetIds.includes(WSTETH_ASSET_ID)

  const { data: vDotApy } = useBifrostVDotApy({
    enabled: assetIds.includes(VDOT_ASSET_ID),
  })

  const { data: ethApr } = useLIDOEthAPR({
    enabled: isGETH,
  })

  const { data: stablepoolFees } = useStablepoolFees(!asset?.isStableSwap)

  const { data: farms } = useOmnipoolFarm(
    isGETH && withFarms ? GETH_ERC20_ASSET_ID : undefined,
  )

  const stablepoolFee = stablepoolFees?.find((fee) => fee.poolId === assetId)

  const {
    totalSupplyApy,
    lpAPY,
    incentivesNetAPR,
    underlyingAssetsAPY,
    totalBorrowApy,
  } = useMemo(() => {
    const underlyingAssetIds = assetIds.map((assetId) => {
      return getErc20(assetId)?.underlyingAssetId ?? assetId
    })

    const underlyingReserves = reserves.filter((reserve) => {
      return underlyingAssetIds
        .map(getAddressFromAssetId)
        .includes(reserve.underlyingAsset)
    })

    const incentives = assetReserve?.aIncentivesData ?? []

    const isIncentivesInfinity = incentives.some(
      (incentive) => incentive.incentiveAPR === "Infinity",
    )

    const incentivesAPRSum = isIncentivesInfinity
      ? Infinity
      : incentives.reduce(
          (aIncentive, bIncentive) => aIncentive + +bIncentive.incentiveAPR,
          0,
        ) * 100

    const incentivesNetAPR = isIncentivesInfinity
      ? Infinity
      : incentivesAPRSum !== Infinity
        ? incentivesAPRSum || 0
        : Infinity

    const underlyingAssetsAPY = underlyingReserves.map((reserve) => {
      const isVdot =
        reserve.underlyingAsset === getAddressFromAssetId(VDOT_ASSET_ID)

      const supplyAPY = isVdot
        ? BN(reserve.supplyAPY).plus(BN(vDotApy ?? 0).div(100))
        : BN(reserve.supplyAPY)

      const borrowAPY = isVdot
        ? BN(reserve.variableBorrowAPY).plus(BN(vDotApy ?? 0).div(100))
        : BN(reserve.variableBorrowAPY)

      return {
        supplyApy: supplyAPY.div(assetsAmount).times(100).toNumber(),
        borrowApy: borrowAPY.div(assetsAmount).times(100).toNumber(),
        id: getAssetIdFromAddress(reserve.underlyingAsset),
      }
    })

    if (isGETH) {
      underlyingAssetsAPY.push({
        id: WSTETH_ASSET_ID,
        supplyApy: BN(ethApr ?? 0)
          .div(assetsAmount)
          .toNumber(),
        borrowApy: BN(ethApr ?? 0)
          .div(assetsAmount)
          .toNumber(),
      })
    }

    const supplyAPYSum = underlyingAssetsAPY.reduce(
      (a, b) => a + b.supplyApy,
      0,
    )

    const borrowAPYSum = underlyingAssetsAPY.reduce(
      (a, b) => a + b.borrowApy,
      0,
    )
    const lpAPY = Number(stablepoolFee?.projectedApyPerc ?? 0)

    return {
      totalSupplyApy: isIncentivesInfinity
        ? Infinity
        : supplyAPYSum +
          incentivesNetAPR +
          lpAPY +
          Number(farms?.totalApr ?? 0),
      totalBorrowApy: borrowAPYSum + incentivesNetAPR + lpAPY,
      lpAPY: lpAPY,
      underlyingAssetsAPY,
      incentivesNetAPR,
    }
  }, [
    assetIds,
    assetReserve?.aIncentivesData,
    getErc20,
    reserves,
    vDotApy,
    stablepoolFee,
    ethApr,
    isGETH,
    farms?.totalApr,
    assetsAmount,
  ])

  return {
    assetId,
    tvl: assetReserve?.totalLiquidityUSD || "0",
    totalSupplyApy,
    totalBorrowApy,
    lpAPY,
    incentivesNetAPR,
    underlyingAssetsAPY,
    vDotApy,
    incentives: assetReserve?.aIncentivesData ?? [],
    farms: farms?.farms,
  }
}
