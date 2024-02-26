import { SBar, SBarContainer, SContainer } from "./OrderCapacity.styled"
import { Text } from "components/Typography/Text/Text"
import BigNumber from "bignumber.js"

export const OrderCapacity = (props: {
  total: BigNumber
  free: BigNumber
  symbol?: string
  modal?: boolean
  roundingMode?: BigNumber.RoundingMode
}) => {
  const { modal = false, roundingMode = 1 } = props

  const filled = props.total.minus(props.free)
  const filledPct = filled
    .div(props.total)
    .multipliedBy(100)
    .decimalPlaces(0, roundingMode)

  return (
    <SContainer modal={modal}>
      <div sx={{ flex: "row", align: "center" }}>
        <SBarContainer modal={modal}>
          <SBar filled={filledPct.toFixed()} />
        </SBarContainer>
        <Text
          fs={modal ? 13 : 12}
          fw={500}
          color="brightBlue100"
          as="span"
          sx={{ ml: 10 }}
        >
          {filledPct.toFixed(0)}%
        </Text>
      </div>
    </SContainer>
  )
}
