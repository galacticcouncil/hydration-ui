import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import { Tooltip } from "@galacticcouncil/ui/components"

import { AssetCapData } from "@/hooks/commonTypes"

type BorrowCapMaxedTooltipProps = {
  borrowCap: AssetCapData
}

export const BorrowCapMaxedTooltip = ({
  borrowCap,
}: BorrowCapMaxedTooltipProps) => {
  if (!borrowCap || !borrowCap.isMaxed) return null

  return (
    <Tooltip
      text={
        <>
          Protocol borrow cap at 100% for this asset. Further borrowing
          unavailable.
        </>
      }
    >
      <CircleInfo />
    </Tooltip>
  )
}
