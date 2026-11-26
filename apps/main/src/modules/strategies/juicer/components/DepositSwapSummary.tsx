import { Separator, Summary } from "@galacticcouncil/ui/components"
import { type FC } from "react"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { useSwapSummaryRows } from "@/components/SwapSummaryRows/useSwapSummaryRows"
import { type useDepositQuote } from "@/modules/strategies/juicer/hooks/useDepositQuote"
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
  const { t } = useTranslation(["juicer", "common"])
  const marketRows = useSwapSummaryRows({
    swap,
    assetIn,
    assetOut: collateral,
    isLoading,
  })

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
          ...(exact ? [] : marketRows),
        ]}
      />
    </>
  )
}
