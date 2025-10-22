import { ExtendedFormattedUser } from "@galacticcouncil/money-market/hooks"
import { AaveV3HydrationMainnet } from "@galacticcouncil/money-market/ui-config"
import {
  formatGhoReserveData,
  formatGhoUserData,
  formatReserveIncentives,
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
  getGhoBorrowApyRange,
  getUserApyValues,
  GhoService,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import { H160 } from "@galacticcouncil/sdk"
import { useAccount } from "@galacticcouncil/web3-connect"
import {
  QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  useBorrowIncentivesContract,
  useBorrowPoolDataContract,
  useGhoServiceContract,
} from "@/api/borrow/contracts"
import { useBlockTimestamp } from "@/api/chain"

export const borrowIncentivesQuery = (
  lendingPoolAddressProvider: string,
  incentivesContract: UiIncentiveDataProvider | null,
) =>
  queryOptions({
    queryKey: ["borrow", "incentives", lendingPoolAddressProvider],
    queryFn: async () => {
      if (!incentivesContract) throw new Error("Invalid incentivesContract")

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

export const borrowReservesQuery = (
  queryClient: QueryClient,
  lendingPoolAddressProvider: string,
  poolDataContract: UiPoolDataProvider | null,
  incentivesContract: UiIncentiveDataProvider | null,
  timestamp: bigint,
) =>
  queryOptions({
    queryKey: ["borrow", "reserves", lendingPoolAddressProvider],
    queryFn: async () => {
      if (!poolDataContract) throw new Error("Invalid poolDataContract")

      const [reserves, reserveIncentives] = await Promise.all([
        poolDataContract.getReservesHumanized({
          lendingPoolAddressProvider,
        }),
        queryClient.ensureQueryData(
          borrowIncentivesQuery(lendingPoolAddressProvider, incentivesContract),
        ),
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
      !!lendingPoolAddressProvider && !!poolDataContract && timestamp > 0n,
  })

export const useBorrowReserves = () => {
  const queryClient = useQueryClient()
  const { data: timestamp } = useBlockTimestamp()
  const poolDataContract = useBorrowPoolDataContract()
  const incentivesContract = useBorrowIncentivesContract()

  const lendingPoolAddressProvider =
    AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER

  return useQuery(
    borrowReservesQuery(
      queryClient,
      lendingPoolAddressProvider,
      poolDataContract,
      incentivesContract,
      timestamp ?? 0n,
    ),
  )
}

export const userBorrowReservesQuery = (
  evmAddress: string,
  lendingPoolAddressProvider: string,
  poolDataContract: UiPoolDataProvider | null,
) =>
  queryOptions({
    queryKey: [
      "borrow",
      "userReserves",
      evmAddress,
      lendingPoolAddressProvider,
    ],
    queryFn: async () => {
      if (!poolDataContract) throw new Error("Invalid poolDataContract")

      return poolDataContract.getUserReservesHumanized({
        lendingPoolAddressProvider,
        user: evmAddress,
      })
    },
    retry: false,
    enabled: !!evmAddress && !!lendingPoolAddressProvider && !!poolDataContract,
  })

export const useUserBorrowReserves = (givenAddress?: string) => {
  const poolDataContract = useBorrowPoolDataContract()

  const { account } = useAccount()

  const address = givenAddress || account?.address || ""
  const evmAddress = H160.fromAny(address)

  const lendingPoolAddressProvider =
    AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER

  return useQuery(
    userBorrowReservesQuery(
      evmAddress,
      lendingPoolAddressProvider,
      poolDataContract,
    ),
  )
}

export const borrowUserIncentivesQuery = (
  evmAddress: string,
  lendingPoolAddressProvider: string,
  incentivesContract: UiIncentiveDataProvider | null,
) =>
  queryOptions({
    queryKey: [
      "borrow",
      "userIncentives",
      evmAddress,
      lendingPoolAddressProvider,
    ],
    queryFn: async () => {
      if (!incentivesContract) throw new Error("Invalid incentivesContract")

      return incentivesContract.getUserReservesIncentivesDataHumanized({
        lendingPoolAddressProvider,
        user: evmAddress,
      })
    },
    retry: false,
    enabled:
      !!evmAddress && !!lendingPoolAddressProvider && !!incentivesContract,
  })

export const useBorrowUserIncentives = (givenAddress?: string) => {
  const incentivesContract = useBorrowIncentivesContract()
  const { account } = useAccount()

  const address = givenAddress || account?.address || ""

  const evmAddress = H160.fromAny(address)

  const lendingPoolAddressProvider =
    AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER

  return useQuery(
    borrowUserIncentivesQuery(
      evmAddress,
      lendingPoolAddressProvider,
      incentivesContract,
    ),
  )
}

export const ghoReserveDataQuery = (ghoServiceContract: GhoService | null) =>
  queryOptions({
    queryKey: ["borrow", "gho", "data"],
    queryFn: async () => {
      if (!ghoServiceContract) throw new Error("Invalid ghoServiceContract")

      const ghoReserveData = await ghoServiceContract.getGhoReserveData()
      const formattedGhoReserveData = formatGhoReserveData({ ghoReserveData })
      return {
        ghoReserveData,
        formattedGhoReserveData,
        ghoBorrowApyRange: getGhoBorrowApyRange(formattedGhoReserveData),
      }
    },
    retry: false,
    enabled: !!ghoServiceContract,
  })

export const useGhoReserveData = () => {
  const ghoServiceContract = useGhoServiceContract()
  return useQuery(ghoReserveDataQuery(ghoServiceContract))
}

export const ghoUserDataQuery = (
  evmAddress: string,
  queryClient: QueryClient,
  ghoServiceContract: GhoService | null,
  timestamp: bigint,
) =>
  queryOptions({
    queryKey: ["borrow", "gho", "userData", evmAddress],
    queryFn: async () => {
      if (!ghoServiceContract) throw new Error("Invalid ghoServiceContract")

      if (timestamp <= 0n) throw new Error("Invalid timestamp")

      const [{ ghoReserveData, formattedGhoReserveData }, ghoUserData] =
        await Promise.all([
          queryClient.ensureQueryData(ghoReserveDataQuery(ghoServiceContract)),
          ghoServiceContract.getGhoUserData(evmAddress),
        ])

      const currentTimestamp = Number(timestamp) / 1000

      return {
        formattedGhoReserveData,
        formattedGhoUserData: formatGhoUserData({
          ghoReserveData,
          ghoUserData,
          currentTimestamp,
        }),
      }
    },
    retry: false,
    enabled: !!evmAddress && !!ghoServiceContract && timestamp > 0n,
  })

export const useGhoUserData = (evmAddress: string) => {
  const { data: timestamp } = useBlockTimestamp()
  const queryClient = useQueryClient()
  const ghoServiceContract = useGhoServiceContract()

  return useQuery(
    ghoUserDataQuery(
      evmAddress,
      queryClient,
      ghoServiceContract,
      timestamp ?? 0n,
    ),
  )
}

export const userBorrowSummaryQuery = (
  evmAddress: string,
  queryClient: QueryClient,
  lendingPoolAddressProvider: string,
  poolDataContract: UiPoolDataProvider | null,
  ghoServiceContract: GhoService | null,
  incentivesContract: UiIncentiveDataProvider | null,
  timestamp: bigint,
) =>
  queryOptions({
    queryKey: ["borrow", "userSummary", evmAddress, lendingPoolAddressProvider],
    queryFn: async () => {
      if (!timestamp || timestamp <= 0n) throw new Error("Invalid timestamp")
      if (!poolDataContract || !ghoServiceContract)
        throw new Error("Invalid poolDataContract or ghoServiceContract")

      const [user, reserves, reserveIncentives, userIncentives, gho] =
        await Promise.all([
          poolDataContract.getUserReservesHumanized({
            lendingPoolAddressProvider,
            user: evmAddress,
          }),
          queryClient.ensureQueryData(
            borrowReservesQuery(
              queryClient,
              lendingPoolAddressProvider,
              poolDataContract,
              incentivesContract,
              timestamp,
            ),
          ),
          queryClient.ensureQueryData(
            borrowIncentivesQuery(
              lendingPoolAddressProvider,
              incentivesContract,
            ),
          ),
          queryClient.ensureQueryData(
            borrowUserIncentivesQuery(
              evmAddress,
              lendingPoolAddressProvider,
              incentivesContract,
            ),
          ),
          queryClient.ensureQueryData(
            ghoUserDataQuery(
              evmAddress,
              queryClient,
              ghoServiceContract,
              timestamp,
            ),
          ),
        ])

      const { userEmodeCategoryId, userReserves } = user
      const { baseCurrencyData, formattedReserves } = reserves
      const { formattedGhoUserData, formattedGhoReserveData } = gho

      const currentTimestamp = Number(timestamp) / 1000

      const summary = formatUserSummaryAndIncentives({
        currentTimestamp,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves,
        formattedReserves,
        userEmodeCategoryId,
        reserveIncentives,
        userIncentives,
      })

      const extendedUser: ExtendedFormattedUser = {
        ...summary,
        ...getUserApyValues(
          summary,
          formattedReserves,
          formattedGhoUserData,
          formattedGhoReserveData,
        ),
        isInEmode: userEmodeCategoryId !== 0,
        userEmodeCategoryId,
      }

      return extendedUser
    },
    retry: false,
    enabled: !!lendingPoolAddressProvider && !!evmAddress && timestamp > 0n,
  })

export const useUserBorrowSummary = (givenAddress?: string) => {
  const queryClient = useQueryClient()
  const { account } = useAccount()
  const { data: timestamp } = useBlockTimestamp()
  const poolDataContract = useBorrowPoolDataContract()
  const ghoServiceContract = useGhoServiceContract()
  const incentivesContract = useBorrowIncentivesContract()

  const address = givenAddress || account?.address || ""
  const evmAddress = H160.fromAny(address)

  const lendingPoolAddressProvider =
    AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER

  return useQuery(
    userBorrowSummaryQuery(
      evmAddress,
      queryClient,
      lendingPoolAddressProvider,
      poolDataContract,
      ghoServiceContract,
      incentivesContract,
      timestamp ?? 0n,
    ),
  )
}
