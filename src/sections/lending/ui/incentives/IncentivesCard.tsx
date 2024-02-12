import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { NoData } from "sections/lending/components/primitives/NoData"
import { IncentivesButton } from "./IncentivesButton"

interface IncentivesCardProps {
  symbol: string
  value: string | number
  incentives?: ReserveIncentiveResponse[]
  tooltip?: ReactNode
  threshold?: number
}

export const IncentivesCard = ({
  symbol,
  value,
  incentives,
  tooltip,
  threshold = 0.01,
}: IncentivesCardProps) => {
  const { t } = useTranslation()
  const percentage = Number(value) * 100
  const belowThreshold = percentage < threshold
  return (
    <>
      <div sx={{ mb: 1 }}>
        {value.toString() !== "-1" ? (
          <>
            {belowThreshold && <span sx={{ color: "basic300" }}>{"<"}</span>}
            {t("value.percentage", {
              value: belowThreshold ? threshold : percentage,
            })}
            {tooltip}
          </>
        ) : (
          <NoData />
        )}
      </div>
      <IncentivesButton incentives={incentives} symbol={symbol} />
    </>
  )
}
