

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const TotalSupplyAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        The weighted average of APY for all supplied assets, including
        incentives.
      </span>
    </TextWithTooltip>
  )
}
