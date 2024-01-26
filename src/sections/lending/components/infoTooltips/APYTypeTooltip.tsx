import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const APYTypeTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        Allows you to switch between <b>variable</b> and <b>stable</b> interest
        rates, where variable rate can increase and decrease depending on the
        amount of liquidity in the reserve, and stable rate will stay the same
        for the duration of your loan.
      </span>
    </TextWithTooltip>
  )
}
