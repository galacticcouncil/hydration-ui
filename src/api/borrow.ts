import { UiPoolDataProvider } from "@aave/contract-helpers"
import {
  calculateHealthFactorFromBalancesBigUnits,
  formatReserves,
  formatUserSummary,
} from "@aave/math-utils"
import { useQuery } from "@tanstack/react-query"
import { isTestnetRpcUrl } from "api/provider"
import { useSpotPrice } from "api/spotPrice"
import { useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "sections/lending/ui-config/addresses"
import { A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { H160, isEvmAccount } from "utils/evm"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"
import { HYDRA_USDT_ASSET_ID } from "sections/memepad/form/MemepadForm.utils"

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
      retry: false,
      enabled: isLoaded && !!evmAddress,
    },
  )
}

export const useHealthFactorChange = (assetId: string, amount: string) => {
  const { getAsset } = useAssets()
  const asset = assetId ? getAsset(assetId) : null
  const isAToken = asset && !!A_TOKEN_UNDERLYING_ID_MAP[asset.id]

  const { data: spotPrice } = useSpotPrice(assetId, HYDRA_USDT_ASSET_ID)
  const { data: userBorrowSummary } = useUserBorrowSummary()

  if (!isAToken) return null

  const currentHealthFactor = userBorrowSummary?.healthFactor ?? "-1"
  const futureHealthFactor = calculateHealthFactorAfterWithdraw(
    assetId ?? "",
    asset?.decimals ?? 0,
    amount ?? "",
    spotPrice?.spotPrice ?? BN_0,
    BN(userBorrowSummary?.totalBorrowsMarketReferenceCurrency ?? BN_0),
    BN(userBorrowSummary?.totalCollateralMarketReferenceCurrency ?? BN_0),
    userBorrowSummary?.currentLiquidationThreshold ?? "0",
  )

  return {
    currentHealthFactor,
    futureHealthFactor,
  }
}

export const calculateHealthFactorAfterWithdraw = (
  assetId: string,
  assetDecimals: number,
  amount: string,
  spotPrice: BN,
  userTotalBorrows: BN,
  userTotalCollateral: BN,
  currentLiquidationThreshold: string,
) => {
  if (
    !assetId ||
    !assetDecimals ||
    !amount ||
    !spotPrice.gt(0) ||
    !userTotalBorrows.gt(0) ||
    !userTotalCollateral.gt(0) ||
    !currentLiquidationThreshold
  ) {
    return "-1"
  }

  const amountToWithdraw = BN(amount).shiftedBy(-assetDecimals)
  const amountToWithdrawInReferenceCurrency =
    amountToWithdraw.multipliedBy(spotPrice)
  const userTotalCollateralAfterWithdraw = userTotalCollateral.minus(
    amountToWithdrawInReferenceCurrency,
  )

  const hf = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: userTotalCollateralAfterWithdraw,
    borrowBalanceMarketReferenceCurrency: userTotalBorrows,
    currentLiquidationThreshold,
  })

  return hf.toString()
}
