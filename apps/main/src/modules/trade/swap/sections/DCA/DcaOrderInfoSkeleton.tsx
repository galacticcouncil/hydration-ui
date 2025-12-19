import { Summary } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const DcaOrderInfoSkeleton: FC = () => {
  return (
    <Summary separator={<SwapSectionSeparator />} withTrailingSeparator>
      <></>
    </Summary>
  )
}
