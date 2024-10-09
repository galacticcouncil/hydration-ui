import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { CapType } from "./helper"

interface CapsTooltipProps {
  availableValue: number
  isUSD?: boolean
  capType: CapType
}

export const CapsTooltip = ({
  availableValue,
  isUSD,
  capType,
}: CapsTooltipProps) => {
  const messageValue = isUSD ? `${availableValue}$` : availableValue

  let message = undefined
  if (availableValue > 0) {
    message =
      capType === CapType.supplyCap ? (
        <span>
          This asset has almost reached its supply cap. There can only be{" "}
          {messageValue} supplied to this market.
        </span>
      ) : (
        <span>
          This asset has almost reached its borrow cap. There is only{" "}
          {messageValue} available to be borrowed from this market.
        </span>
      )
  } else if (availableValue <= 0) {
    message =
      capType === CapType.supplyCap ? (
        <span>
          This asset has reached its supply cap. Nothing is available to be
          supplied from this market.
        </span>
      ) : (
        <span>
          This asset has reached its borrow cap. Nothing is available to be
          borrowed from this market.
        </span>
      )
  }

  return <InfoTooltip text={message} />
}
