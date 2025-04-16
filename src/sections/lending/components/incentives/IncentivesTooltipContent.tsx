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
      <div sx={{ display: "flex", align: "center" }}>
        {incentiveAPR !== "Infinity" ? (
          <>
            <Text fs={14}>
              <FormattedNumber value={+incentiveAPR} percent />
            </Text>
            <Text fs={14} sx={{ ml: 4 }}>
              APR
            </Text>
          </>
        ) : (
          <>
            <Text>∞ %</Text>
            <Text fs={14} sx={{ ml: 4 }}>
              APR
            </Text>
          </>
        )}
      </div>
    )
  }

  return (
    <div sx={{ flex: "column", justify: "center", align: "center" }}>
      <Text fs={14} color="basic400" sx={{ mb: 4 }}>
        Participating in this {symbol} reserve gives annualized rewards.
      </Text>
      <div sx={{ width: "100%" }}>
        {incentives.map((incentive) => (
          <Row
            sx={{ mt: 4, align: "center" }}
            caption={
              <div sx={{ flex: "row", align: "center" }}>
                <TokenIcon
                  address={incentive.rewardTokenAddress}
                  size={20}
                  sx={{ mr: 8 }}
                />
                <Text fs={14}>{incentive.rewardTokenSymbol}</Text>
              </div>
            }
            key={incentive.rewardTokenAddress}
          >
            <Number incentiveAPR={incentive.incentiveAPR} />
          </Row>
        ))}
        {incentives.length > 1 && (
          <div
            css={{ borderTop: `1px solid ${theme.colors.basic700}` }}
            sx={{ pt: 8, mt: 8 }}
          >
            <Row caption={<Text fs={14}>Net APR</Text>}>
              <Number incentiveAPR={incentivesNetAPR} />
            </Row>
          </div>
        )}
      </div>
    </div>
  )
}
