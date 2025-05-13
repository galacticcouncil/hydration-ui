import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import { Tooltip } from "@galacticcouncil/ui/components"

export const APYTypeTooltip = () => (
  <Tooltip
    text={
      <>
        Allows you to switch between <b>variable</b> and <b>stable</b> interest
        rates, where variable rate can increase and decrease depending on the
        amount of liquidity in the reserve, and stable rate will stay the same
        for the duration of your loan.
      </>
    }
  >
    <CircleInfo />
  </Tooltip>
)
