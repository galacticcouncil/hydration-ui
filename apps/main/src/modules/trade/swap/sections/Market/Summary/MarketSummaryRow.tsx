import { SummaryRow, SummaryRowProps } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"

export const MarketSummaryRow: FC<SummaryRowProps> = (props) => {
  return <SummaryRow sx={{ my: getTokenPx("scales.paddings.s") }} {...props} />
}
