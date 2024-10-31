import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import { Text } from "components/Typography/Text/Text"

import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Row } from "sections/lending/components/primitives/Row"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { theme } from "theme"

interface IncentivesTooltipContentProps {
  incentives: ReserveIncentiveResponse[]
  incentivesNetAPR: "Infinity" | number
  symbol: string
}

export const IncentivesTooltipContent = ({
  incentives,
  incentivesNetAPR,
  symbol,
}: IncentivesTooltipContentProps) => {
  const Number = ({
    incentiveAPR,
  }: {
    incentiveAPR: "Infinity" | number | string
  }) => {
    return (
      <div css={{ display: "inline-flex", alignItems: "center" }}>
        {incentiveAPR !== "Infinity" ? (
          <>
            <FormattedNumber value={+incentiveAPR} percent />
            <Text sx={{ ml: 4 }}>
              <span>APR</span>
            </Text>
          </>
        ) : (
          <>
            <Text>∞ %</Text>
            <Text sx={{ ml: 4 }}>
              <span>APR</span>
            </Text>
          </>
        )}
      </div>
    )
  }

  return (
    <div sx={{ flex: "column", justify: "center", align: "center" }}>
      <Text color="basic400" sx={{ mb: 4 }}>
        <span>
          Participating in this {symbol} reserve gives annualized rewards.
        </span>
      </Text>

      <div sx={{ width: "100%" }}>
        {incentives.map((incentive) => (
          <Row
            caption={
              <div
                sx={{
                  flex: "row",
                  align: "center",
                  mb: incentives.length > 1 ? 2 : 0,
                }}
              >
                <TokenIcon
                  symbol={incentive.rewardTokenSymbol}
                  size={20}
                  sx={{ mr: 16 }}
                />
                <Text>{incentive.rewardTokenSymbol}</Text>
              </div>
            }
            key={incentive.rewardTokenAddress}
          >
            <Number incentiveAPR={incentive.incentiveAPR} />
          </Row>
        ))}

        {incentives.length > 1 && (
          <div
            css={{ border: `1px solid ${theme.colors.basic400}` }}
            sx={{
              pt: 4,
              mt: 4,
            }}
          >
            <Row caption={<span>Net APR</span>}>
              <Number incentiveAPR={incentivesNetAPR} />
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}
