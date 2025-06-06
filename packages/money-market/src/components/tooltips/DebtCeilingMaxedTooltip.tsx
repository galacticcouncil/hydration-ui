import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import { Tooltip } from "@galacticcouncil/ui/components"

import { AssetCapData } from "@/hooks/commonTypes"

type DebtCeilingMaxedTooltipProps = {
  debtCeiling: AssetCapData
}

export const DebtCeilingMaxedTooltip = ({
  debtCeiling,
}: DebtCeilingMaxedTooltipProps) => {
  if (!debtCeiling || !debtCeiling.isMaxed) return null

  return (
    <Tooltip
      text={
        <>
          Protocol debt ceiling is at 100% for this asset. Futher borrowing
          against this asset is unavailable.
        </>
      }
    >
      <CircleInfo />
    </Tooltip>
  )
}
