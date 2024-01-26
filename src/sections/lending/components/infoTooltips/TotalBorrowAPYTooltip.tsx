import { Trans } from "@lingui/macro"

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const TotalBorrowAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        The weighted average of APY for all borrowed assets, including
        incentives.
      </span>
    </TextWithTooltip>
  )
}
