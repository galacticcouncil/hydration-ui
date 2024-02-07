import {
  TextWithTooltip,
  TextWithTooltipProps,
} from "sections/lending/components/TextWithTooltip"

export const SlippageTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <span>
        Slippage is the difference between the quoted and received amounts from
        changing market conditions between the moment the transaction is
        submitted and its verification.
      </span>
    </TextWithTooltip>
  )
}
