import { valueToBigNumber } from "@aave/math-utils"
import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import { DotsHorizontalIcon } from "@heroicons/react/solid"
import { useState } from "react"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { IncentivesTooltipContent } from "./IncentivesTooltipContent"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { Box, SvgIcon } from "@mui/material"

interface IncentivesButtonProps {
  symbol: string
  incentives?: ReserveIncentiveResponse[]
  displayBlank?: boolean
}

const BlankIncentives = () => {
  return (
    <div
      sx={{
        px: 4,
        flex: "row",
        align: "center",
        justify: "center",
      }}
    >
      &nbsp;
    </div>
  )
}

export const IncentivesButton = ({
  incentives,
  symbol,
  displayBlank,
}: IncentivesButtonProps) => {
  const [open, setOpen] = useState(false)

  if (!(incentives && incentives.length > 0)) {
    if (displayBlank) {
      return <BlankIncentives />
    } else {
      return null
    }
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
    if (displayBlank) {
      return <BlankIncentives />
    } else {
      return null
    }
  }

  const incentivesButtonValue = () => {
    if (incentivesNetAPR !== "Infinity" && incentivesNetAPR < 10000) {
      return (
        <FormattedNumber
          value={incentivesNetAPR}
          percent
          variant="secondary12"
          color="text.secondary"
        />
      )
    } else if (incentivesNetAPR !== "Infinity" && incentivesNetAPR > 9999) {
      return (
        <FormattedNumber
          value={incentivesNetAPR}
          percent
          compact
          variant="secondary12"
          color="text.secondary"
        />
      )
    } else if (incentivesNetAPR === "Infinity") {
      return <Text color="basic400">∞</Text>
    }
  }

  const iconSize = 12

  return (
    <InfoTooltip
      text={
        <IncentivesTooltipContent
          incentives={incentives}
          incentivesNetAPR={incentivesNetAPR}
          symbol={symbol}
        />
      }
    >
      <Box
        sx={(theme) => ({
          p: { xs: "0 4px", xsm: "2px 4px" },
          border: `1px solid ${
            open ? theme.palette.action.disabled : theme.palette.divider
          }`,
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.2s ease",
          bgcolor: open ? "action.hover" : "transparent",
          "&:hover": {
            bgcolor: "action.hover",
            borderColor: "action.disabled",
          },
        })}
        onClick={() => {
          setOpen(!open)
        }}
      >
        <Box sx={{ mr: 8 }}>{incentivesButtonValue()}</Box>

        <Box sx={{ display: "inline-flex" }}>
          <>
            {incentives.length < 5 ? (
              <>
                {incentives.map((incentive) => (
                  <TokenIcon
                    symbol={incentive.rewardTokenSymbol}
                    sx={{ fontSize: `${iconSize}px`, ml: -1 }}
                    key={incentive.rewardTokenSymbol}
                  />
                ))}
              </>
            ) : (
              <>
                {incentives.slice(0, 3).map((incentive) => (
                  <TokenIcon
                    symbol={incentive.rewardTokenSymbol}
                    sx={{ fontSize: `${iconSize}px`, ml: -1 }}
                    key={incentive.rewardTokenSymbol}
                  />
                ))}
                <SvgIcon
                  sx={{
                    fontSize: `${iconSize}px`,
                    borderRadius: "50%",
                    bgcolor: "common.white",
                    color: "common.black",
                    ml: -1,
                    zIndex: 5,
                  }}
                >
                  <DotsHorizontalIcon />
                </SvgIcon>
              </>
            )}
          </>
        </Box>
      </Box>
    </InfoTooltip>
  )
}
