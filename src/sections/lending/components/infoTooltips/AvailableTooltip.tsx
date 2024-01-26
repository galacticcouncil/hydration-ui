import { CapType } from "sections/lending/components/caps/helper"
import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

interface AvailableTooltipProps extends TextWithTooltipProps {
  capType: CapType
}

export const AvailableTooltip = ({
  capType,
  ...rest
}: AvailableTooltipProps) => {
  const description =
    capType === CapType.supplyCap ? (
      <span>
        This is the total amount that you are able to supply to in this reserve.
        You are able to supply your wallet balance up until the supply cap is
        reached.
      </span>
    ) : (
      <span>
        This is the total amount available for you to borrow. You can borrow
        based on your collateral and until the borrow cap is reached.
      </span>
    )

  return <TextWithTooltip {...rest}>{description}</TextWithTooltip>
}
