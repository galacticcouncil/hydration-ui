import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { useMaxBalanceWithFee } from "@/modules/transactions/hooks/useMaxBalanceWithFee"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

export const useMaxSellAmount = ({
  assetIn,
  assetOut,
}: {
  assetIn: string
  assetOut: string
}) => {
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const rpc = useRpcProvider()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const { data: accountFeePaymentAssetId } = useAccountFeePaymentAssetId()
  const { getTransferableBalance } = useAccountBalances()
  const enabled =
    rpc.isApiLoaded && !!account && accountFeePaymentAssetId === Number(assetIn)

  const { data: tx } = useQuery({
    enabled,
    queryKey: ["maxSellAmount", assetIn, assetOut],
    queryFn: async () => {
      const swap = await rpc.sdk.api.router.getBestSell(
        Number(assetIn),
        Number(assetOut),
        "1",
      )
      const twap = await rpc.sdk.api.scheduler.getTwapSellOrder(
        Number(assetIn),
        Number(assetOut),
        "1",
      )

      const swapTx = await rpc.sdk.tx
        .trade(swap)
        .withSlippage(swapSlippage)
        .withBeneficiary(account?.address ?? "")
        .build()
        .then((tx) => tx.get())

      const twapTx = await rpc.sdk.tx
        .order(twap)
        .withBeneficiary(account?.address ?? "")
        .build()
        .then((tx) => tx.get())

      return {
        swapTx,
        twapTx,
      }
    },
  })

  const maxSwapBalanceWithFee = useMaxBalanceWithFee(tx?.swapTx ?? null)
  const maxTwapBalanceWithFee = useMaxBalanceWithFee(tx?.twapTx ?? null)

  if (!enabled) {
    const balance = scaleHuman(
      getTransferableBalance(assetIn).toString(),
      getAssetWithFallback(assetIn).decimals,
    )

    return {
      maxSwapSellBalance: balance,
      maxTwapSellBalance: balance,
    }
  }

  return {
    maxSwapSellBalance: maxSwapBalanceWithFee?.maxBalanceHuman ?? "0",
    maxTwapSellBalance: maxTwapBalanceWithFee?.maxBalanceHuman ?? "0",
  }
}
