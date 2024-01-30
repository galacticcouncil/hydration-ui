

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const CollateralSwitchTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        Allows you to decide whether to use a supplied asset as collateral. An
        asset used as collateral will affect your borrowing power and health
        factor.
      </span>
    </TextWithTooltip>
  )
}
