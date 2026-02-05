import { SummaryRow, SummaryRowProps } from "@galacticcouncil/ui/components"
import { FC } from "react"

export const SwapSummaryRow: FC<SummaryRowProps> = (props) => {
  return (
    <SummaryRow
      sx={{
        my: "s",
        justifyContent: "space-between",
        mx: "var(--swap-section-inset-inline)",
        px: "var(--swap-section-padding-inline)",
      }}
      {...props}
    />
  )
}
