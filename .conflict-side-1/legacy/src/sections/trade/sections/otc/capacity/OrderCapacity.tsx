import { SContainer } from "./OrderCapacity.styled"
import BigNumber from "bignumber.js"
import { LinearProgress } from "components/Progress/LinearProgress/LinearProgress"

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
      <LinearProgress
        color="pink600"
        colorEnd="brightBlue600"
        percent={filledPct.toNumber()}
        size={modal ? "medium" : "small"}
      >{`${filledPct.toNumber()}%`}</LinearProgress>
    </SContainer>
  )
}
