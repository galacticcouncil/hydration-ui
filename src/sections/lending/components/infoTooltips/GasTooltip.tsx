import { GENERAL } from "sections/lending/utils/mixPanelEvents"

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const GasTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        This gas calculation is only an estimation. Your wallet will set the
        price of the transaction. You can modify the gas settings directly from
        your wallet provider.
      </span>
    </TextWithTooltip>
  )
}
