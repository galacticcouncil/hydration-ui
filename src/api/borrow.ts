import {
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
import { ExtendedFormattedUser } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { reserveSortFn } from "sections/lending/store/poolSelectors"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "sections/lending/ui-config/addresses"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"
import {
  calculateHFAfterSupply,
  calculateHFAfterWithdraw,
} from "sections/lending/utils/hfUtils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getAddressFromAssetId, getAssetIdFromAddress, H160 } from "utils/evm"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { useAssets } from "providers/assets"
import { calculateMaxWithdrawAmount } from "sections/lending/components/transactions/Withdraw/utils"
import { HEALTH_FACTOR_RISK_THRESHOLD } from "sections/lending/ui-config/misc"
import { VDOT_ASSET_ID } from "utils/constants"
import { useBifrostVDotApy } from "api/external/bifrost"
import { useStablepoolFees } from "./stableswap"

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

      return incentivesContract.getReservesIncentivesDataHumanized({
        lendingPoolAddressProvider,
      })
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

export const useHealthFactorChange = (
  assetId: string,
  amount: string,
  action: "withdraw" | "supply" = "withdraw",
): UseHealthFactorChangeResult => {
  const { getErc20 } = useAssets()
  const underlyingAssetId = getErc20(assetId)?.underlyingAssetId

  const { data: user } = useUserBorrowSummary()

  return useMemo(() => {
    if (!underlyingAssetId || !user) return null

    const reserveAddress = getAddressFromAssetId(underlyingAssetId)

    const userReserve = user.userReservesData.find(
      ({ reserve }) => reserve.underlyingAsset === reserveAddress,
    )

    if (!userReserve) return null

    const currentHealthFactor = user.healthFactor
    const futureHealthFactor =
      action === "withdraw"
        ? calculateHFAfterWithdraw({
            user: user,
            userReserve: userReserve,
            poolReserve: userReserve.reserve,
            withdrawAmount: amount || "0",
          }).toString()
        : calculateHFAfterSupply({
            user,
            poolReserve: userReserve.reserve,
            supplyAmount: amount || "0",
          }).toString()

    const isHealthFactorBelowThreshold =
      currentHealthFactor !== "-1" &&
      futureHealthFactor !== "-1" &&
      Number(futureHealthFactor) < HEALTH_FACTOR_RISK_THRESHOLD

    return {
      isHealthFactorBelowThreshold,
      currentHealthFactor,
      futureHealthFactor,
    }
  }, [action, amount, underlyingAssetId, user])
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
  tvl: string
  apy: number
  lpAPY: number
  incentivesAPY: number
  underlyingAssetsAPY: { apy: number; id: string }[]
}

export const useBorrowAssetApy = (assetId: string): BorrowAssetApyData => {
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

  const { data: vDotApy } = useBifrostVDotApy({
    enabled: assetIds.includes(VDOT_ASSET_ID),
  })

  const { data: stablepoolFees } = useStablepoolFees(
    asset?.isStableSwap ? [assetId] : [],
  )

  const stablepoolFee = stablepoolFees?.find((fee) => fee.poolId === assetId)

  const { totalAPY, lpAPY, incentivesAPY, underlyingAssetsAPY } =
    useMemo(() => {
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

      const incentivesAPY = isIncentivesInfinity
        ? Infinity
        : incentivesAPRSum !== Infinity
          ? incentivesAPRSum || 0
          : Infinity

      const underlyingAssetsAPY = underlyingReserves.map((reserve) => {
        const isVdot =
          reserve.underlyingAsset === getAddressFromAssetId(VDOT_ASSET_ID)

        const supplyAPY = isVdot
          ? BN(reserve.supplyAPY).plus(BN(vDotApy?.apy ?? 0).div(100))
          : BN(reserve.supplyAPY)
        return {
          apy: supplyAPY.div(underlyingReserves.length).times(100).toNumber(),
          id: getAssetIdFromAddress(reserve.underlyingAsset),
        }
      })

      const supplyAPYSum = underlyingAssetsAPY.reduce((a, b) => a + b.apy, 0)
      const lpAPY = Number(stablepoolFee?.projectedApyPerc ?? 0)

      return {
        totalAPY: isIncentivesInfinity
          ? Infinity
          : supplyAPYSum + incentivesAPY + lpAPY,
        lpAPY: lpAPY,
        underlyingAssetsAPY,
        incentivesAPY,
      }
    }, [
      assetIds,
      assetReserve?.aIncentivesData,
      getErc20,
      reserves,
      vDotApy?.apy,
      stablepoolFee,
    ])

  return {
    tvl: assetReserve?.totalLiquidityUSD || "0",
    apy: totalAPY,
    lpAPY,
    incentivesAPY,
    underlyingAssetsAPY,
  }
}
