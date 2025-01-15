import { UiPoolDataProvider } from "@aave/contract-helpers"
import { formatReserves, formatUserSummary } from "@aave/math-utils"
import { useQuery } from "@tanstack/react-query"
import { isTestnetRpcUrl } from "api/provider"
import { useRpcProvider } from "providers/rpcProvider"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "sections/lending/ui-config/addresses"
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import { QUERY_KEYS } from "utils/queryKeys"

export const useUserBorrowSummary = () => {
  const { api, evm, isLoaded } = useRpcProvider()
  const { account } = useEvmAccount()

  const address = account?.address ?? ""

  return useQuery(
    QUERY_KEYS.borrowUserSummary(address),
    async () => {
      const isTestnet = isTestnetRpcUrl(evm.connection.url)

      const addresses = isTestnet
        ? AaveV3HydrationTestnet
        : AaveV3HydrationMainnet

      const poolDataContract = new UiPoolDataProvider({
        uiPoolDataProviderAddress: addresses.UI_POOL_DATA_PROVIDER,
        provider: evm,
        chainId: parseFloat(import.meta.env.VITE_EVM_CHAIN_ID),
      })

      const [reserves, user, timestamp] = await Promise.all([
        poolDataContract.getReservesHumanized({
          lendingPoolAddressProvider: addresses.POOL_ADDRESSES_PROVIDER,
        }),
        poolDataContract.getUserReservesHumanized({
          lendingPoolAddressProvider: addresses.POOL_ADDRESSES_PROVIDER,
          user: address,
        }),
        api.query.timestamp.now(),
      ])

      const { baseCurrencyData, reservesData } = reserves
      const { userEmodeCategoryId, userReserves } = user

      const currentTimestamp = timestamp.toNumber() / 1000

      const formattedReserves = formatReserves({
        currentTimestamp,
        reserves: reservesData,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
      })

      return formatUserSummary({
        currentTimestamp,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves,
        formattedReserves,
        userEmodeCategoryId,
      })
    },
    {
      enabled: isLoaded && !!address,
    },
  )
}
