import { UiPoolDataProvider } from "@aave/contract-helpers"
import { formatReserves, formatUserSummary } from "@aave/math-utils"
import { useQuery } from "@tanstack/react-query"
import { isPaseoRpcUrl, isTestnetRpcUrl } from "api/provider"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "sections/lending/ui-config/addresses"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { H160, isEvmAccount } from "utils/evm"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"

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

      const formattedReserves = formatReserves({
        currentTimestamp,
        reserves: reservesData,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
      })

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

      const { formattedReserves, baseCurrencyData } = reserves
      const { userEmodeCategoryId, userReserves } = user

      const currentTimestamp = timestamp.toNumber() / 1000

      return formatUserSummary({
        currentTimestamp,
        marketReferencePriceInUsd:
          reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves,
        formattedReserves,
        userEmodeCategoryId,
      })
    },
    {
      retry: false,
      enabled: isLoaded && isReservesSuccess && !!evmAddress,
    },
  )
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
