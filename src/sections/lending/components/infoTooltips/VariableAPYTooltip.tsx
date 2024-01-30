

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const VariableAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        Variable interest rate will <b>fluctuate</b> based on the market
        conditions. Recommended for short-term positions.
      </span>
    </TextWithTooltip>
  )
}
