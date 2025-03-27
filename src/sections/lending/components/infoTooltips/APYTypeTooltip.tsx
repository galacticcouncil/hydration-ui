import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"

export const APYTypeTooltip = () => {
  return (
    <InfoTooltip
      text={
        <Text fs={12}>
          Allows you to switch between <b>variable</b> and <b>stable</b>{" "}
          interest rates, where variable rate can increase and decrease
          depending on the amount of liquidity in the reserve, and stable rate
          will stay the same for the duration of your loan.
        </Text>
      }
    />
  )
}
