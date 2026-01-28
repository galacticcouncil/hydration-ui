import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import {
  Flex,
  Separator,
  Stack,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Big } from "big.js"
import { useState } from "react"

import { ReserveLogo } from "@/components/primitives/ReserveLogo"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"

import { SContainer } from "./IncentivesButton.styled"

interface IncentivesButtonProps {
  symbol: string
  incentives?: ReserveIncentiveResponse[]
  displayBlank?: boolean
}

export const IncentivesButton = ({
  incentives = [],
  symbol,
}: IncentivesButtonProps) => {
  const { formatPercent } = useAppFormatters()
  const [open, setOpen] = useState(false)

  if (!incentives.length) {
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
      ? Big(incentivesAPRSum || 0).toNumber()
      : "Infinity"

  if (incentivesNetAPR === 0) {
    return null
  }

  const incentivesButtonValue = () => {
    if (incentivesNetAPR !== "Infinity") {
      return (
        <Text color={getToken("text.medium")} fs="p6">
          {formatPercent(incentivesNetAPR * 100)}
        </Text>
      )
    } else {
      return (
        <Text fs="p6" color={getToken("text.medium")}>
          ∞
        </Text>
      )
    }
  }

  return (
    <Tooltip
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
        <Flex>
          {incentives.map((incentive) => (
            <ReserveLogo
              key={incentive.rewardTokenSymbol}
              address={incentive.rewardTokenAddress}
              size="extra-small"
              sx={{ ml: -3 }}
            />
          ))}
        </Flex>
      </SContainer>
    </Tooltip>
  )
}

type IncentivesTooltipContentProps = {
  incentives: ReserveIncentiveResponse[]
  incentivesNetAPR: "Infinity" | number
  symbol: string
}

export const IncentivesTooltipContent: React.FC<
  IncentivesTooltipContentProps
> = ({
  incentives,
  incentivesNetAPR,
  symbol,
}: IncentivesTooltipContentProps) => {
  const { formatPercent } = useAppFormatters()
  const FormattedNumber = ({
    incentiveAPR,
  }: {
    incentiveAPR: "Infinity" | number | string
  }) => {
    return (
      <Flex align="center" gap="s">
        {incentiveAPR !== "Infinity" ? (
          <>
            <Text>{formatPercent(Number(incentiveAPR) * 100)}</Text>
            <Text>APR</Text>
          </>
        ) : (
          <>
            <Text>∞ %</Text>
            <Text>APR</Text>
          </>
        )}
      </Flex>
    )
  }

  return (
    <Flex direction="column">
      <Text mb="base">
        Participating in this {symbol} reserve gives annualized rewards.
      </Text>
      <Stack gap="s">
        {incentives.map((incentive) => (
          <Flex
            key={incentive.rewardTokenAddress}
            align="center"
            justify="space-between"
          >
            <Flex align="center" gap="s">
              <ReserveLogo
                address={incentive.rewardTokenAddress}
                size="small"
              />
              <Text>{incentive.rewardTokenSymbol}</Text>
            </Flex>
            <FormattedNumber incentiveAPR={incentive.incentiveAPR} />
          </Flex>
        ))}

        {incentives.length > 1 && (
          <>
            <Separator
              sx={{
                borderTop: "1px solid",
                borderColor: getToken("buttons.primary.low.rest"),
              }}
            />
            <Flex align="center" justify="space-between">
              <Text>Net APR</Text>
              <FormattedNumber incentiveAPR={incentivesNetAPR} />
            </Flex>
          </>
        )}
      </Stack>
    </Flex>
  )
}
