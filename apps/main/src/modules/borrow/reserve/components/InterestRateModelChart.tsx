import {
  getInterestRates,
  InterestRateModelOpts,
} from "@galacticcouncil/money-market/utils"
import { AreaChart } from "@galacticcouncil/ui/components"
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

export type InterestRateModelChartProps = {
  reserve: InterestRateModelOpts
}

const ReferenceLineLabel = (props: {
  value: number
  title: string
  yOffset?: number
  xOffset?: number
  color: string
  viewBox: {
    x: number
    y: number
  }
}) => {
  const yOffset = props.yOffset ?? 0
  const xOffset = props.xOffset ?? 0
  const { t } = useTranslation()
  return (
    <foreignObject
      sx={{ height: 24, width: 100 }}
      x={props.viewBox.x - xOffset}
      y={yOffset}
    >
      <div>
        <span sx={{ fontSize: 12, whiteSpace: "nowrap" }}>
          {props.title} {t("percent", { value: props.value })}
        </span>
      </div>
    </foreignObject>
  )
}

export const InterestRateModelChart: React.FC<InterestRateModelChartProps> = ({
  reserve,
}) => {
  const { t } = useTranslation()

  const rates = getInterestRates(reserve)

  const optimalValue = bigShift(reserve.optimalUsageRatio, -27)
    .mul(100)
    .toNumber()

  const currentValue = Big(reserve.utilizationRate).mul(100).toNumber()

  return (
    <AreaChart
      height={240}
      data={rates}
      gradient="none"
      xAxisProps={{
        type: "number",
      }}
      config={{
        xAxisKey: "utilization",
        xAxisFormatter: (value) => t("percent", { value }),
        yAxisFormatter: (value) => t("percent", { value: value * 100 }),
        series: [
          {
            key: "variableRate",
            label: "Value",
            color: "#E53E76",
          },
        ],
      }}
      referenceLines={[
        {
          x: Math.round(currentValue * 2) / 2,
          stroke: "#ED6AFF",
          strokeDasharray: "4 2",
          shapeRendering: "crispEdges",
          label: (props) => (
            <ReferenceLineLabel
              {...props}
              value={currentValue}
              xOffset={currentValue > 50 ? 85 : -3}
              yOffset={25}
              title="Current"
            />
          ),
        },
        {
          x: Math.round(optimalValue * 2) / 2,
          stroke: "#ED6AFF",
          strokeDasharray: "4 2",
          shapeRendering: "crispEdges",
          label: (props) => (
            <ReferenceLineLabel
              {...props}
              value={optimalValue}
              xOffset={optimalValue > 50 ? 85 : -3}
              yOffset={5}
              title="Optimal"
              color="#ED6AFF"
            />
          ),
        },
      ]}
    />
  )
}
