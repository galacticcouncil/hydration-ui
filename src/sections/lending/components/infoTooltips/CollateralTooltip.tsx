

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const CollateralTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        The total amount of your assets denominated in USD that can be used as
        collateral for borrowing assets.
      </span>
    </TextWithTooltip>
  )
}
