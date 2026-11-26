import { type SummaryRowProps } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { type Trade } from "@/api/trade"
import { TradeFee } from "@/components/TradeFee/TradeFee"
import { type TAsset } from "@/providers/assetsProvider"

/**
 * The price, price impact and trade fee rows of a sell quoted into
 * `assetOut`, for a form's summary.
 */
export const useSwapSummaryRows = ({
  swap,
  assetIn,
  assetOut,
  isLoading,
}: {
  swap?: Trade
  assetIn: TAsset
  assetOut: TAsset
  isLoading: boolean
}): SummaryRowProps[] => {
  const { t } = useTranslation(["common", "trade"])

  const rate =
    swap && swap.amountIn > 0n
      ? Big(formatUnits(swap.amountOut, assetOut.decimals))
          .div(formatUnits(swap.amountIn, assetIn.decimals))
          .toString()
      : null

  return [
    {
      label: t("price"),
      content: rate
        ? t("swapPrice", {
            symbolIn: assetIn.symbol,
            value: rate,
            symbol: assetOut.symbol,
          })
        : "—",
      loading: isLoading,
    },
    {
      label: t("priceImpact"),
      content: swap ? t("percent", { value: swap.priceImpactPct || 0 }) : "—",
      tooltip: t("trade:market.summary.priceImpact.tooltip"),
      loading: isLoading,
    },
    {
      label: t("trade:market.summary.estTradeFees"),
      content: (
        <TradeFee swap={swap} receiveAsset={assetOut} isLoading={isLoading} />
      ),
    },
  ]
}
