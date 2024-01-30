

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const MaxLTVTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        The Maximum LTV ratio represents the maximum borrowing power of a
        specific collateral. For example, if a collateral has an LTV of 75%, the
        user can borrow up to 0.75 worth of ETH in the principal currency for
        every 1 ETH worth of collateral.
      </span>
    </TextWithTooltip>
  )
}
