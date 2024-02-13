import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const BorrowPowerTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        The % of your total borrowing power used. This is based on the amount of
        your collateral supplied and the total amount that you can borrow.
      </span>
    </TextWithTooltip>
  )
}
