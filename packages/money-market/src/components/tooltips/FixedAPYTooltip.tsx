import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import { Tooltip } from "@galacticcouncil/ui/components"

import { GHO_SYMBOL } from "@/utils/ghoUtilities"

export const FixedAPYTooltip = () => {
  return (
    <Tooltip
      text={`This rate may be changed over time depending on the need for the ${GHO_SYMBOL} supply to contract/expand.`}
    >
      <CircleInfo />
    </Tooltip>
  )
}
