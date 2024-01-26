import { ExclamationIcon } from "@heroicons/react/outline"

import { TextWithTooltip } from "sections/lending/components/TextWithTooltip"
import { StETHCollateralWarning } from "sections/lending/components/Warnings/StETHCollateralWarning"

export const StETHCollateralToolTip = () => {
  return (
    <TextWithTooltip
      wrapperProps={{ ml: 2 }}
      color="warning.main"
      iconSize={20}
      icon={<ExclamationIcon />}
    >
      <StETHCollateralWarning />
    </TextWithTooltip>
  )
}
