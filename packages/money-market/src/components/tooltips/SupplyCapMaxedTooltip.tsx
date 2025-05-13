import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import { Tooltip } from "@galacticcouncil/ui/components"

import { AssetCapData } from "@/hooks/commonTypes"

type SupplyCapMaxedTooltipProps = {
  supplyCap: AssetCapData
}

export const SupplyCapMaxedTooltip = ({
  supplyCap,
}: SupplyCapMaxedTooltipProps) => {
  if (!supplyCap || !supplyCap.isMaxed) return null

  return (
    <Tooltip
      text={
        <>
          Protocol supply cap at 100% for this asset. Further supply
          unavailable.
        </>
      }
    >
      <CircleInfo />
    </Tooltip>
  )
}
