import { TradeConfigCursor } from "@galacticcouncil/apps"
import { useQuery } from "@tanstack/react-query"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { QUERY_KEYS } from "utils/queryKeys"

const calculateSlippage = (amount: string, slippagePct: string): string => {
  const slippage = BN(amount).div(100).multipliedBy(slippagePct)

  return slippage.decimalPlaces(0, 1).toString()
}

export const getMinAmountOut = (
  amountOut: string,
  slippagePct: string,
): string => {
  const slippage = calculateSlippage(amountOut, slippagePct)

  return BN(amountOut).minus(slippage).toString()
}

export const useBestTradeSell = (
  assetInId: string,
  assetOutId: string,
  amountIn: string,
  onSuccess?: (minAmount: string) => void,
) => {
  const { api, sdk, isLoaded } = useRpcProvider()
  const { account } = useAccount()

  const { api: sdkApi, tx: sdkTx } = sdk

  const slippageData = TradeConfigCursor.deref().slippage

  const { data: tradeData, isInitialLoading } = useQuery({
    queryKey: QUERY_KEYS.bestTradeSell(assetInId, assetOutId, amountIn),
    queryFn: async () => {
      const data = await sdkApi.router.getBestSell(
        assetInId,
        assetOutId,
        amountIn,
      )

      onSuccess?.(
        getMinAmountOut(data?.amountOut.toString() || "0", slippageData || "0"),
      )

      return data
    },
    enabled: isLoaded && !!assetInId && !!assetOutId && !!amountIn,
  })

  const amountOut = tradeData?.amountOut.toString() || "0"
  const minAmountOut = getMinAmountOut(amountOut, slippageData || "0")

  const getSwapTx = async () => {
    if (!tradeData || !account) return undefined

    const builtTx = await sdkTx
      .trade(tradeData)
      .withSlippage(Number(slippageData))
      .withBeneficiary(account.address)
      .build()

    return api.tx(builtTx.hex)
  }

  return {
    minAmountOut,
    getSwapTx,
    amountOut,
    isLoading: isInitialLoading,
  }
}
