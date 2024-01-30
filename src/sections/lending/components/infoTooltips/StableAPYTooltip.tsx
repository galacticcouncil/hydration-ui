

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const StableAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        Stable interest rate will <b>stay the same</b> for the duration of your
        loan. Recommended for long-term loan periods and for users who prefer
        predictability.
      </span>
    </TextWithTooltip>
  )
}
