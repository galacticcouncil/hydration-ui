import { Summary, SummaryRow } from "@galacticcouncil/ui/components"

import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const XcSwapSummary = () => {
  return (
    <Summary separator={<SwapSectionSeparator />}>
      <SummaryRow label="Total fees" content={"-"} />
    </Summary>
  )
}
