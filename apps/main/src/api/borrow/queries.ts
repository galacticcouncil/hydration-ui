import { AaveV3HydrationMainnet } from "@galacticcouncil/money-market/ui-config"
import {
  formatReserveIncentives,
  formatReservesAndIncentives,
  UiIncentiveDataProvider,
} from "@galacticcouncil/money-market/utils"
import { queryOptions, useQuery } from "@tanstack/react-query"

import {
  useBorrowIncentivesContract,
  useBorrowPoolDataContract,
} from "@/api/borrow/contracts"
import { useRpcProvider } from "@/providers/rpcProvider"

export const borrowIncentivesQuery = (
  lendingPoolAddressProvider: string,
  incentivesContract: UiIncentiveDataProvider | null,
) =>
  queryOptions({
    queryKey: ["borrowIncentives", lendingPoolAddressProvider],
    queryFn: async () => {
      if (!incentivesContract) return null

      const incentives =
        await incentivesContract.getReservesIncentivesDataHumanized({
          lendingPoolAddressProvider,
        })

      return formatReserveIncentives(incentives)
    },
    retry: false,
    enabled: !!lendingPoolAddressProvider && !!incentivesContract,
  })

export const useBorrowIncentives = () => {
  const incentivesContract = useBorrowIncentivesContract()

  const lendingPoolAddressProvider =
    AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER

  return useQuery(
    borrowIncentivesQuery(lendingPoolAddressProvider, incentivesContract),
  )
}

export const useBorrowReserves = () => {
  const { papi } = useRpcProvider()
  const poolDataContract = useBorrowPoolDataContract()

  const { data: reserveIncentives, isSuccess: isIncentivesSuccess } =
    useBorrowIncentives()

  const lendingPoolAddressProvider =
    AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER

  return useQuery({
    queryKey: ["borrowReserves", lendingPoolAddressProvider],
    queryFn: async () => {
      if (!poolDataContract) return null

      const [reserves, timestamp] = await Promise.all([
        poolDataContract.getReservesHumanized({
          lendingPoolAddressProvider,
        }),
        papi.query.Timestamp.Now.getValue({
          at: "best",
        }),
      ])

      const { baseCurrencyData, reservesData } = reserves
      const currentTimestamp = Number(timestamp) / 1000

      const formattedReserves = formatReservesAndIncentives({
        currentTimestamp,
        reserves: reservesData,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        reserveIncentives: reserveIncentives ?? [],
      }).map((r) => ({
        ...r,
        iconSymbol: r.symbol,
        isEmodeEnabled: r.eModeCategoryId !== 0,
        isWrappedBaseAsset: false,
      }))

      return {
        formattedReserves,
        baseCurrencyData,
      }
    },
    retry: false,
    enabled:
      !!lendingPoolAddressProvider && !!poolDataContract && isIncentivesSuccess,
  })
}
