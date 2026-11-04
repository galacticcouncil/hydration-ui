import { SummaryRow, SummaryRowValue } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"

export type SwapPriceImpactSummaryRowProps = {
  priceImpactPct: number
  loading: boolean
}

export const SwapPriceImpactSummaryRow: React.FC<
  SwapPriceImpactSummaryRowProps
> = ({ priceImpactPct, loading }) => {
  const { formatPercent } = useAppFormatters()

  return (
    <SummaryRow
      label="Price impact"
      loading={loading}
      content={
        <SummaryRowValue
          color={
            priceImpactPct <= -1
              ? getToken("accents.danger.secondary")
              : getToken("text.high")
          }
        >
          {formatPercent(priceImpactPct)}
        </SummaryRowValue>
      }
    />
  )
}
