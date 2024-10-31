import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import { ReactNode } from "react"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { NoData } from "sections/lending/components/primitives/NoData"
import { IncentivesButton } from "./IncentivesButton"

interface IncentivesCardProps {
  symbol: string
  value: string | number
  incentives?: ReserveIncentiveResponse[]
  tooltip?: ReactNode
}

export const IncentivesCard = ({
  symbol,
  value,
  incentives,
  tooltip,
}: IncentivesCardProps) => {
  return (
    <div
      sx={{
        flex: "column",
        align: "center",
        justify: "center",
        textAlign: "center",
      }}
    >
      {value.toString() !== "-1" ? (
        <div sx={{ flex: "row" }}>
          <FormattedNumber value={value} percent />
          {tooltip}
        </div>
      ) : (
        <NoData />
      )}

      <IncentivesButton incentives={incentives} symbol={symbol} />
    </div>
  )
}
