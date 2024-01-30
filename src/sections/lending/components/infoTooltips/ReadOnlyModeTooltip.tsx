

import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const ReadOnlyModeTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        Read-only mode allows to see address positions in Aave, but you
        won&apos;t be able to perform transactions.
      </span>
    </TextWithTooltip>
  )
}
