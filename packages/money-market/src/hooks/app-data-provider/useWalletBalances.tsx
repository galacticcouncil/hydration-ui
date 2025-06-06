import { ReservesDataHumanized } from "@aave/contract-helpers"
import { normalize, USD_DECIMALS } from "@aave/math-utils"
import { Big } from "big.js"
import { useMemo, useState } from "react"
import { useDeepCompareEffect } from "react-use"

import { usePoolsReservesHumanized } from "@/hooks/pool/usePoolReserves"
import { usePoolsTokensBalance } from "@/hooks/pool/usePoolTokensBalance"
import { UserPoolTokensBalances } from "@/services/WalletBalanceService"
import { useRootStore } from "@/store/root"
import { nativeToUSD } from "@/utils"
import { MarketDataType } from "@/utils/marketsAndNetworksConfig"

export interface WalletBalance {
  address: string
  amount: string
}

type FormatAggregatedBalanceParams = {
  reservesHumanized?: ReservesDataHumanized
  balances?: UserPoolTokensBalances[]
  marketData: MarketDataType
}

const formatAggregatedBalance = ({
  reservesHumanized,
  balances,
}: FormatAggregatedBalanceParams) => {
  const reserves = reservesHumanized?.reservesData || []
  const baseCurrencyData = reservesHumanized?.baseCurrencyData || {
    marketReferenceCurrencyDecimals: 0,
    marketReferenceCurrencyPriceInUsd: "0",
    networkBaseTokenPriceInUsd: "0",
    networkBaseTokenPriceDecimals: 0,
  }

  const walletBalances = balances ?? []
  // process data
  let hasEmptyWallet = true
  const aggregatedBalance = walletBalances.reduce(
    (acc, reserve) => {
      const poolReserve = reserves.find((poolReserve) => {
        return poolReserve.underlyingAsset.toLowerCase() === reserve.address
      })
      if (reserve.amount !== "0") hasEmptyWallet = false
      if (poolReserve) {
        acc[reserve.address] = {
          amount: normalize(reserve.amount, poolReserve.decimals),
          amountUSD: nativeToUSD({
            amount: Big(reserve.amount),
            currencyDecimals: poolReserve.decimals,
            priceInMarketReferenceCurrency:
              poolReserve.priceInMarketReferenceCurrency,
            marketReferenceCurrencyDecimals:
              baseCurrencyData.marketReferenceCurrencyDecimals,
            normalizedMarketReferencePriceInUsd: normalize(
              baseCurrencyData.marketReferenceCurrencyPriceInUsd,
              USD_DECIMALS,
            ),
          }),
        }
      }
      return acc
    },
    {} as { [address: string]: { amount: string; amountUSD: string } },
  )
  return {
    walletBalances: aggregatedBalance,
    hasEmptyWallet,
  }
}

export const usePoolsWalletBalances = (marketDatas: MarketDataType[]) => {
  const user = useRootStore((store) => store.account)
  const tokensBalanceQueries = usePoolsTokensBalance(marketDatas, user)
  const poolsBalancesQueries = usePoolsReservesHumanized(marketDatas)

  const isLoading =
    tokensBalanceQueries.find((elem) => elem.isInitialLoading) ||
    poolsBalancesQueries.find((elem) => elem.isInitialLoading)

  const walletBalances = useMemo(() => {
    if (isLoading) return []
    const walletBalances = poolsBalancesQueries.map((query, index) =>
      formatAggregatedBalance({
        reservesHumanized: query.data,
        balances: tokensBalanceQueries[index]?.data,
        marketData: marketDatas[index],
      }),
    )
    return walletBalances
  }, [isLoading, marketDatas, poolsBalancesQueries, tokensBalanceQueries])

  return {
    isLoading,
    walletBalances,
  }
}

export const useWalletBalances = (marketData: MarketDataType) => {
  const { walletBalances, isLoading } = usePoolsWalletBalances([marketData])
  const [balances, setBalances] = useState<
    Record<
      string,
      {
        amount: string
        amountUSD: string
      }
    >
  >({})
  const [loading, setLoading] = useState(true)
  const [hasEmptyWallet, setHasEmptyWallet] = useState(true)

  useDeepCompareEffect(() => {
    setBalances(walletBalances[0]?.walletBalances ?? {})
    setLoading(!!isLoading)
    setHasEmptyWallet(walletBalances[0]?.hasEmptyWallet)
  }, [walletBalances[0]?.walletBalances, { isLoading }])

  return {
    walletBalances: balances,
    hasEmptyWallet,
    loading,
  }
}
