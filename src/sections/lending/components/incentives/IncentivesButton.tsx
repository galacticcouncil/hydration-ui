import { valueToBigNumber } from "@aave/math-utils"
import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import MoreDotsIcon from "assets/icons/MoreDotsIcon.svg?react"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { useState } from "react"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { SContainer } from "./IncentivesButton.styled"
import { IncentivesTooltipContent } from "./IncentivesTooltipContent"
import { Text } from "components/Typography/Text/Text"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"

interface IncentivesButtonProps {
  symbol: string
  incentives?: ReserveIncentiveResponse[]
  displayBlank?: boolean
}

export const IncentivesButton = ({
  incentives,
  symbol,
}: IncentivesButtonProps) => {
  const [open, setOpen] = useState(false)

  if (!(incentives && incentives.length > 0)) {
    return null
  }

  const isIncentivesInfinity = incentives.some(
    (incentive) => incentive.incentiveAPR === "Infinity",
  )
  const incentivesAPRSum = isIncentivesInfinity
    ? "Infinity"
    : incentives.reduce(
        (aIncentive, bIncentive) => aIncentive + +bIncentive.incentiveAPR,
        0,
      )
  const incentivesNetAPR = isIncentivesInfinity
    ? "Infinity"
    : incentivesAPRSum !== "Infinity"
      ? valueToBigNumber(incentivesAPRSum || 0).toNumber()
      : "Infinity"

  if (incentivesNetAPR === 0) {
    return null
  }

  const incentivesButtonValue = () => {
    if (incentivesNetAPR !== "Infinity") {
      return (
        <FormattedNumber
          sx={{ color: "basic400" }}
          value={incentivesNetAPR}
          percent
          compact={incentivesNetAPR > 9999}
        />
      )
    } else {
      return (
        <Text fs={12} color="basic400">
          ∞
        </Text>
      )
    }
  }

  const iconSize = 12

  return (
    <InfoTooltip
      asChild
      text={
        <IncentivesTooltipContent
          incentives={incentives}
          incentivesNetAPR={incentivesNetAPR}
          symbol={symbol}
        />
      }
    >
      <SContainer
        onClick={() => {
          setOpen(!open)
        }}
      >
        <div sx={{ mr: 4 }}>{incentivesButtonValue()}</div>
        <div sx={{ display: "inline-flex" }}>
          <>
            {incentives.length < 5 ? (
              <>
                {incentives.map((incentive) => (
                  <TokenIcon
                    symbol={incentive.rewardTokenSymbol}
                    size={iconSize}
                    sx={{ ml: -2 }}
                    key={incentive.rewardTokenSymbol}
                  />
                ))}
              </>
            ) : (
              <>
                {incentives.slice(0, 3).map((incentive) => (
                  <TokenIcon
                    symbol={incentive.rewardTokenSymbol}
                    size={iconSize}
                    sx={{ ml: -2 }}
                    key={incentive.rewardTokenSymbol}
                  />
                ))}
                <div
                  css={{
                    background: "white",
                    borderRadius: "50%",
                    width: iconSize,
                    height: iconSize,
                    marginLeft: -2,
                    zIndex: 5,
                    color: "black",
                  }}
                >
                  <MoreDotsIcon width={iconSize - 2} height={iconSize - 2} />
                </div>
              </>
            )}
          </>
        </div>
      </SContainer>
    </InfoTooltip>
  )
}
