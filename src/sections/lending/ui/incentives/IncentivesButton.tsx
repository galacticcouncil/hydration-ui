import { valueToBigNumber } from "@aave/math-utils"
import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import MoreDotsIcon from "assets/icons/MoreDotsIcon.svg?react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ContentWithTooltip } from "sections/lending/components/ContentWithTooltip"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { SContainer } from "./IncentivesButton.styled"
import { IncentivesTooltipContent } from "./IncentivesTooltipContent"

interface IncentivesButtonProps {
  symbol: string
  incentives?: ReserveIncentiveResponse[]
  displayBlank?: boolean
}

export const IncentivesButton = ({
  incentives,
  symbol,
  displayBlank,
}: IncentivesButtonProps) => {
  const { t } = useTranslation()
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
    if (incentivesNetAPR === "Infinity") {
      return <span sx={{ color: "basic300" }}>∞</span>
    } else {
      return (
        <span sx={{ color: "basic300" }}>
          {t("value.percentage", { value: incentivesNetAPR * 100 })}
        </span>
      )
    }
  }

  const iconSize = 12

  return (
    <ContentWithTooltip
      tooltipContent={
        <IncentivesTooltipContent
          incentives={incentives}
          incentivesNetAPR={incentivesNetAPR}
          symbol={symbol}
        />
      }
      withoutHover
      setOpen={setOpen}
      open={open}
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
                    sx={{ fontSize: `${iconSize}px`, ml: -2 }}
                    key={incentive.rewardTokenSymbol}
                  />
                ))}
              </>
            ) : (
              <>
                {incentives.slice(0, 3).map((incentive) => (
                  <TokenIcon
                    symbol={incentive.rewardTokenSymbol}
                    sx={{ fontSize: `${iconSize}px`, ml: -2 }}
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
    </ContentWithTooltip>
  )
}
