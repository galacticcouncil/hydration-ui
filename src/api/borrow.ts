import { UiPoolDataProvider } from "@aave/contract-helpers"
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
import { calculateHFAfterWithdraw } from "sections/lending/utils/hfUtils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getAddressFromAssetId, H160, isEvmAccount } from "utils/evm"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { useAssets } from "providers/assets"
import { calculateMaxWithdrawAmount } from "sections/lending/components/transactions/Withdraw/utils"
import { HEALTH_FACTOR_RISK_THRESHOLD } from "sections/lending/ui-config/misc"

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

export const useBorrowReserves = () => {
  const { api } = useRpcProvider()
  const poolDataContract = useBorrowPoolDataContract()
  const addresses = useBorrowContractAddresses()

  return useQuery(
    QUERY_KEYS.borrowReserves(addresses?.POOL_ADDRESSES_PROVIDER ?? ""),
    async () => {
      if (!poolDataContract || !addresses) return null

      const [reserves, timestamp] = await Promise.all([
        poolDataContract.getReservesHumanized({
          lendingPoolAddressProvider: addresses.POOL_ADDRESSES_PROVIDER,
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
        // @TODO: fetch incentives when we need to access them outside of MoneyMarket
        reserveIncentives: [],
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
      enabled: !!addresses && !!poolDataContract,
    },
  )
}

export const useUserBorrowSummary = (givenAddress?: string) => {
  const { account } = useAccount()
  const { api, isLoaded } = useRpcProvider()
  const { data: reserves, isSuccess: isReservesSuccess } = useBorrowReserves()
  const poolDataContract = useBorrowPoolDataContract()
  const addresses = useBorrowContractAddresses()

  const address = givenAddress || account?.address

  const isEvm = isEvmAccount(address)

  const evmAddress = useMemo(() => {
    if (!address) return ""
    if (isEvm) return H160.fromAccount(address)
    return H160.fromSS58(address)
  }, [isEvm, address])

  return useQuery(
    QUERY_KEYS.borrowUserSummary(evmAddress),
    async () => {
      if (!reserves || !poolDataContract || !addresses) return null

      const [user, timestamp] = await Promise.all([
        poolDataContract.getUserReservesHumanized({
          lendingPoolAddressProvider: addresses.POOL_ADDRESSES_PROVIDER,
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
        // @TODO: fetch incentives when we need to access them outside of MoneyMarket
        reserveIncentives: [],
        userIncentives: [],
      })

      const extendedUser: ExtendedFormattedUser = {
        ...summary,
        isInEmode: userEmodeCategoryId !== 0,
        userEmodeCategoryId,
        calculatedUserIncentives: {},
        // @TODO: calculate correct user APYs when we need to access them outside of MoneyMarket
        earnedAPY: 0,
        debtAPY: 0,
        netAPY: 0,
      }

      return extendedUser
    },
    {
      retry: false,
      enabled: isLoaded && isReservesSuccess && !!evmAddress,
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
    const futureHealthFactor = calculateHFAfterWithdraw({
      user: user,
      userReserve: userReserve,
      poolReserve: userReserve.reserve,
      withdrawAmount: amount || "0",
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
  }, [amount, underlyingAssetId, user])
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
