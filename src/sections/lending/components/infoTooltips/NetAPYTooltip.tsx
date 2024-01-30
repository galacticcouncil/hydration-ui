

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const NetAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        Net APY is the combined effect of all supply and borrow positions on net
        worth, including incentives. It is possible to have a negative net APY
        if debt APY is higher than supply APY.
      </span>
    </TextWithTooltip>
  )
}
