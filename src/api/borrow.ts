import { UiPoolDataProvider } from "@aave/contract-helpers"
import {
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
} from "@aave/math-utils"
import { useQuery } from "@tanstack/react-query"
import { isTestnetRpcUrl } from "api/provider"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { ExtendedFormattedUser } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "sections/lending/ui-config/addresses"
import { A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"
import { calculateHFAfterWithdraw } from "sections/lending/utils/hfUtils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getAddressFromAssetId, H160, isEvmAccount } from "utils/evm"
import { QUERY_KEYS } from "utils/queryKeys"

export const useUserBorrowSummary = (givenAddress?: string) => {
  const { account } = useAccount()
  const { api, evm, isLoaded } = useRpcProvider()

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
      const isTestnet = isTestnetRpcUrl(evm.connection.url)

      const contracts = isTestnet
        ? AaveV3HydrationTestnet
        : AaveV3HydrationMainnet

      const poolDataContract = new UiPoolDataProvider({
        uiPoolDataProviderAddress: contracts.UI_POOL_DATA_PROVIDER,
        provider: evm,
        chainId: parseFloat(import.meta.env.VITE_EVM_CHAIN_ID),
      })

      const [reserves, user, timestamp] = await Promise.all([
        poolDataContract.getReservesHumanized({
          lendingPoolAddressProvider: contracts.POOL_ADDRESSES_PROVIDER,
        }),
        poolDataContract.getUserReservesHumanized({
          lendingPoolAddressProvider: contracts.POOL_ADDRESSES_PROVIDER,
          user: evmAddress,
        }),
        api.query.timestamp.now(),
      ])

      const { baseCurrencyData, reservesData } = reserves
      const { userEmodeCategoryId, userReserves } = user

      const currentTimestamp = timestamp.toNumber() / 1000

      const formattedReserves = formatReservesAndIncentives({
        currentTimestamp,
        reserves: reservesData,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        reserveIncentives: [],
      })

      const summary = formatUserSummaryAndIncentives({
        currentTimestamp,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves,
        formattedReserves,
        userEmodeCategoryId,
        reserveIncentives: [],
        userIncentives: [],
      })

      const extendedUser = {
        ...summary,
        isInEmode: userEmodeCategoryId !== 0,
        userEmodeCategoryId,
        calculatedUserIncentives: {},
      } as ExtendedFormattedUser

      return extendedUser
    },
    {
      retry: false,
      enabled: isLoaded && !!evmAddress,
    },
  )
}

export const useHealthFactorChange = (assetId: string, amount: string) => {
  const underlyingAssetId = A_TOKEN_UNDERLYING_ID_MAP[assetId]

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

    return {
      currentHealthFactor,
      futureHealthFactor,
    }
  }, [amount, underlyingAssetId, user])
}
