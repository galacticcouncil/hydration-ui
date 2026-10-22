import { Separator, Summary } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { type FC } from "react"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { TradeFee } from "@/components/TradeFee/TradeFee"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import { type useDepositQuote } from "@/modules/strategies/propeller/hooks/useDepositQuote"
import { type TAsset } from "@/providers/assetsProvider"

type DepositSwapSummaryProps = {
  assetIn: TAsset
  collateral: TAsset
  quote: ReturnType<typeof useDepositQuote>
}

export const DepositSwapSummary: FC<DepositSwapSummaryProps> = ({
  assetIn,
  collateral,
  quote: { swap, depositAmount, exact, isLoading },
}) => {
  const { t } = useTranslation(["propeller", "common", "trade"])

  const rate =
    swap && swap.amountIn > 0n
      ? Big(formatUnits(swap.amountOut, collateral.decimals))
          .div(formatUnits(swap.amountIn, assetIn.decimals))
          .toString()
      : null

  return (
    <>
      <Separator mx="-xl" />
      <Summary
        separator={<Separator mx="-xl" />}
        rows={[
          {
            label: t("deposit.swap.deposit"),
            content:
              depositAmount === undefined
                ? "—"
                : t("common:currency", {
                    value: formatUnits(depositAmount, collateral.decimals),
                    symbol: collateral.symbol,
                  }),
            tooltip: t(
              exact
                ? "deposit.swap.deposit.tooltip.exact"
                : "deposit.swap.deposit.tooltip",
              {
                symbol: collateral.symbol,
              },
            ),
            loading: isLoading,
          },
          // the 1:1 unwrap has no price, impact, fee or trade limit to show
          ...(exact
            ? []
            : [
                {
                  label: t("common:price"),
                  content: rate
                    ? t("deposit.swap.price", {
                        symbolIn: assetIn.symbol,
                        value: rate,
                        symbol: collateral.symbol,
                      })
                    : "—",
                  loading: isLoading,
                },
                {
                  label: t("common:priceImpact"),
                  content: swap
                    ? t("common:percent", {
                        value: Number(swap.priceImpactPct.toFixed(2)) || 0,
                      })
                    : "—",
                  tooltip: t("trade:market.summary.priceImpact.tooltip"),
                  loading: isLoading,
                },
                {
                  label: t("trade:market.summary.estTradeFees"),
                  content: (
                    <TradeFee
                      swap={swap}
                      receiveAsset={collateral}
                      isLoading={isLoading}
                    />
                  ),
                },
                {
                  label: t("common:tradeLimit"),
                  content: <TradeLimit type={TradeLimitType.Trade} />,
                },
              ]),
        ]}
      />
    </>
  )
}
