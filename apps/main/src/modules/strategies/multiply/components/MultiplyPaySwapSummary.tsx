import { SummaryRow } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { useSwapSummaryRows } from "@/components/SwapSummaryRows/useSwapSummaryRows"
import { type usePayQuote } from "@/modules/strategies/multiply/hooks/usePayAsset"
import { type TAsset } from "@/providers/assetsProvider"

type MultiplyPaySwapSummaryProps = {
  payAsset: TAsset
  collateral: TAsset
  quote: ReturnType<typeof usePayQuote>
}

/** Rows for the pay → collateral sell; sits in the open form's summary. */
export const MultiplyPaySwapSummary: React.FC<MultiplyPaySwapSummaryProps> = ({
  payAsset,
  collateral,
  quote: { swap, minAmountOut, state },
}) => {
  const { t } = useTranslation("common")
  const isLoading = state === "loading"
  const rows = useSwapSummaryRows({
    swap,
    assetIn: payAsset,
    assetOut: collateral,
    isLoading,
  })

  return (
    <>
      <SummaryRow
        label={t("minimumReceived")}
        loading={isLoading}
        content={
          minAmountOut === undefined
            ? "-"
            : t("currency", {
                value: formatUnits(minAmountOut, collateral.decimals),
                symbol: collateral.symbol,
              })
        }
      />
      {rows.map((row) => (
        <SummaryRow key={String(row.label)} {...row} />
      ))}
    </>
  )
}
