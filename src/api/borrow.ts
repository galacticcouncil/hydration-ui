import {
  ProtocolAction,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@aave/contract-helpers"
import {
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
} from "@aave/math-utils"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
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
import { TErc20, useAssets } from "providers/assets"
import { calculateMaxWithdrawAmount } from "sections/lending/components/transactions/Withdraw/utils"
import { HEALTH_FACTOR_RISK_THRESHOLD } from "sections/lending/ui-config/misc"
import { useStablepoolFees } from "./stableswap"
import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import { TFarmAprData, useOmnipoolFarms } from "./farms"
import { useDefillamaLatestApyQueries } from "api/external/defillama"
import { uniqBy, zipArrays } from "utils/rx"
import { identity } from "utils/helpers"
import {
  TReservesBalance,
  TStablePoolDetails,
  useStableSwapReservesMulti,
} from "sections/pools/PoolsPage.utils"
import { useStableArray } from "hooks/useStableArray"

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

export const useBorrowUserReserves = (givenAddress?: string) => {
  const poolDataContract = useBorrowPoolDataContract()
  const addresses = useBorrowContractAddresses()

  const { account } = useAccount()

  const address = givenAddress || account?.address || ""

  const evmAddress = H160.fromAny(address)

  const lendingPoolAddressProvider = addresses?.POOL_ADDRESSES_PROVIDER ?? ""

  return useQuery(
    QUERY_KEYS.borrowUserReserves(lendingPoolAddressProvider, evmAddress),
    async () => {
      if (!poolDataContract || !evmAddress) return null

      return poolDataContract.getUserReservesHumanized({
        lendingPoolAddressProvider,
        user: evmAddress,
      })
    },
    {
      retry: false,
      enabled:
        !!evmAddress && !!lendingPoolAddressProvider && !!poolDataContract,
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

type UnderlyingAssetApy = {
  id: string
  isStaked: boolean
  supplyApy: number
  borrowApy: number
}

export type BorrowAssetApyData = {
  assetId: string
  tvl: string
  vDotApy?: number
  lpAPY: number
  incentivesNetAPR: number
  incentives: ReserveIncentiveResponse[]
  underlyingAssetsApyData: UnderlyingAssetApy[]
  underlyingSupplyApy: number
  underlyingBorrowApy: number
  totalSupplyApy: number
  totalBorrowApy: number
  farms: TFarmAprData[] | undefined
  stablepoolData: TStablePoolDetails | undefined
}

const calculateIncentivesNetAPR = (incentives: any[]) => {
  const isIncentivesInfinity = incentives.some(
    (incentive) => incentive.incentiveAPR === "Infinity",
  )

  if (isIncentivesInfinity) {
    return Infinity
  }

  const total = incentives.reduce(
    (total, incentive) => total + Number(incentive.incentiveAPR),
    0,
  )

  const percent = total * 100

  return percent
}

const calculateTotalSupplyAndBorrowApy = (
  underlyingAssetsApyData: UnderlyingAssetApy[],
  incentivesNetAPR: number,
  lpAPY: number,
  farmsAPR: number,
) => {
  const underlyingSupplyApy = underlyingAssetsApyData.reduce(
    (total, asset) => total + asset.supplyApy,
    0,
  )

  const underlyingBorrowApy = underlyingAssetsApyData.reduce(
    (total, asset) => total + asset.borrowApy,
    0,
  )

  const totalSupplyApy =
    underlyingSupplyApy + incentivesNetAPR + lpAPY + farmsAPR
  const totalBorrowApy = underlyingBorrowApy + incentivesNetAPR + lpAPY

  return {
    underlyingSupplyApy,
    underlyingBorrowApy,
    totalSupplyApy,
    totalBorrowApy,
  }
}

type CalculatedAssetApyTotals = Pick<
  BorrowAssetApyData,
  | "totalSupplyApy"
  | "totalBorrowApy"
  | "underlyingBorrowApy"
  | "underlyingSupplyApy"
  | "underlyingAssetsApyData"
  | "incentivesNetAPR"
>

const calculateAssetApyTotals = (
  stableSwapAssetIds: string[],
  stableSwapBalances: TReservesBalance,
  underlyingReserves: ComputedReserveData[],
  incentives: ReserveIncentiveResponse[],
  externalApysMap: Map<string, UseQueryResult<number>>,
  lpAPY: number,
  farmsAPR: number,
  getRelatedAToken: (id: string) => TErc20 | undefined,
): CalculatedAssetApyTotals => {
  const assetCount = stableSwapAssetIds.length
  const incentivesNetAPR = calculateIncentivesNetAPR(incentives)

  const underlyingAssetsApyData = underlyingReserves.map<UnderlyingAssetApy>(
    (reserve) => {
      const id = getAssetIdFromAddress(reserve.underlyingAsset)
      const supplyAPY = BN(reserve.supplyAPY)
      const borrowAPY = BN(reserve.variableBorrowAPY)
      const balanceId = getRelatedAToken(id)?.id ?? id
      const percentage =
        stableSwapBalances.find((bal) => bal.id === balanceId)?.percentage ??
        100 / assetCount

      const proportion = percentage / 100

      return {
        id,
        isStaked: false,
        supplyApy: supplyAPY.times(100).times(proportion).toNumber(),
        borrowApy: borrowAPY.times(100).times(proportion).toNumber(),
      }
    },
  )

  for (const id of stableSwapAssetIds) {
    const externalApy = externalApysMap.get(id)

    if (externalApy?.data) {
      const percentage =
        stableSwapBalances.find((bal) => bal.id === id)?.percentage ??
        100 / assetCount

      const proportion = percentage / 100

      underlyingAssetsApyData.push({
        id,
        isStaked: true,
        supplyApy: BN(externalApy.data).times(proportion).toNumber(),
        borrowApy: BN(externalApy.data).times(proportion).toNumber(),
      })
    }
  }

  const apySums = calculateTotalSupplyAndBorrowApy(
    underlyingAssetsApyData,
    incentivesNetAPR,
    lpAPY,
    farmsAPR,
  )

  return {
    ...apySums,
    underlyingAssetsApyData,
    incentivesNetAPR,
  }
}

export const useBorrowAssetsApy = (assetIds: string[], withFarms = false) => {
  const { getAsset, getErc20, getRelatedAToken } = useAssets()
  const { data: borrowReserves, isLoading: isLoadingReserves } =
    useBorrowReserves()
  const { data: stablepoolFees, isLoading: isLoadingStablepoolFees } =
    useStablepoolFees()

  const assetIdsMemo = useStableArray(assetIds)

  const { data: stableSwapReserves, isLoading: isLoadingStableSwapReserves } =
    useStableSwapReservesMulti(assetIdsMemo)
  const stablepoolsMap = useMemo(() => {
    return new Map(stableSwapReserves.map((item) => [item.poolId, item.data]))
  }, [stableSwapReserves])

  const farmsConfig = useMemo<Record<string, string>>(() => {
    if (!withFarms) return {}
    return Object.fromEntries(
      assetIdsMemo.map((assetId) => [
        assetId,
        getRelatedAToken(assetId)?.id ?? "",
      ]),
    )
  }, [assetIdsMemo, getRelatedAToken, withFarms])

  const omnipoolAssetIdsWithFarms = useMemo(
    () => Object.values(farmsConfig),
    [farmsConfig],
  )

  const { data: omnipoolFarms, isLoading: isLoadingFarms } = useOmnipoolFarms(
    omnipoolAssetIdsWithFarms,
  )

  const reserves = useMemo(
    () => borrowReserves?.formattedReserves ?? [],
    [borrowReserves],
  )

  const allAssetIds = useMemo(() => {
    const ids = assetIdsMemo.flatMap((assetId) => {
      const asset = getAsset(assetId)
      return asset?.isStableSwap && asset.meta
        ? Object.keys(asset.meta)
        : [assetId]
    })
    return uniqBy(identity, ids)
  }, [assetIdsMemo, getAsset])

  const isLoadingBase =
    isLoadingStableSwapReserves || isLoadingReserves || isLoadingStablepoolFees

  const isLoading =
    omnipoolAssetIdsWithFarms.length > 0
      ? isLoadingBase || isLoadingFarms
      : isLoadingBase

  const externalApys = useDefillamaLatestApyQueries(allAssetIds)
  const externalApysMap = useMemo(() => {
    const externalApyEntries = zipArrays(allAssetIds, externalApys)
    return new Map(externalApyEntries)
  }, [allAssetIds, externalApys])

  const data = useMemo<BorrowAssetApyData[]>(() => {
    if (isLoading) return []
    return assetIdsMemo.map((assetId) => {
      const asset = getAsset(assetId)
      const assetReserve = reserves.find(
        ({ underlyingAsset }) =>
          underlyingAsset === getAddressFromAssetId(assetId),
      )

      const stablepoolFee = stablepoolFees?.find(
        (fee) => fee.poolId === assetId,
      )

      const farmsAssetId = farmsConfig?.[assetId] ?? ""
      const farmsData =
        farmsAssetId && omnipoolFarms
          ? omnipoolFarms.get(farmsAssetId)
          : undefined

      const stableSwapAssetIds =
        asset?.isStableSwap && asset.meta ? Object.keys(asset.meta) : [assetId]

      const underlyingAssetIds = stableSwapAssetIds.map((assetId) => {
        return getErc20(assetId)?.underlyingAssetId ?? assetId
      })

      const underlyingReserves = reserves.filter((reserve) => {
        return underlyingAssetIds
          .map(getAddressFromAssetId)
          .includes(reserve.underlyingAsset)
      })

      const lpAPY = Number(stablepoolFee?.projectedApyPerc ?? 0)
      const farmsAPR = Number(farmsData?.totalApr ?? 0)
      const incentives = assetReserve?.aIncentivesData ?? []

      const stablepoolData = stablepoolsMap.get(assetId)

      const calculatedData = calculateAssetApyTotals(
        stableSwapAssetIds,
        stablepoolData?.balances ?? [],
        underlyingReserves,
        assetReserve?.aIncentivesData ?? [],
        externalApysMap,
        lpAPY,
        farmsAPR,
        getRelatedAToken,
      )

      return {
        assetId,
        tvl: assetReserve?.totalLiquidityUSD || "0",
        farms: farmsData?.farms,
        lpAPY,
        farmsAPR,
        incentives,
        stablepoolData,
        ...calculatedData,
      }
    })
  }, [
    assetIdsMemo,
    externalApysMap,
    farmsConfig,
    getAsset,
    getErc20,
    getRelatedAToken,
    isLoading,
    omnipoolFarms,
    reserves,
    stablepoolsMap,
    stablepoolFees,
  ])

  return {
    data,
    isLoading,
  }
}
