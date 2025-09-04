import {
  getInterestRates,
  InterestRateModelOpts,
} from "@galacticcouncil/money-market/utils"
import { AreaChart, Box, Text } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

export type InterestRateModelChartProps = {
  config: InterestRateModelOpts
}

const REFERENCE_LABEL_WIDTH = 95
export const VARIABLE_BORROW_RATE_COLOR = "#E53E76"

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
  const { t } = useTranslation()
  const yOffset = props.yOffset ?? 0
  const xOffset = props.xOffset ?? 0
  return (
    <foreignObject
      sx={{ height: 28, width: REFERENCE_LABEL_WIDTH }}
      x={props.viewBox.x - xOffset}
      y={yOffset}
    >
      <Box
        bg={getToken("accents.info.primary")}
        color={getToken("accents.info.onPrimary")}
        py={4}
        borderRadius="md"
      >
        <Text fs={12} fw={500} lh={1} whiteSpace="nowrap" align="center">
          {props.title} {t("percent", { value: props.value })}
        </Text>
      </Box>
    </foreignObject>
  )
}

export const InterestRateModelChart: React.FC<InterestRateModelChartProps> = ({
  config,
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const { themeProps } = useTheme()

  const rates = useMemo(() => getInterestRates(config), [config])

  const optimalValue = bigShift(config.optimalUsageRatio, -27)
    .mul(100)
    .toNumber()

  const currentValue = Big(config.utilizationRate).mul(100).toNumber()

  return (
    <AreaChart
      aspectRatio="2.5 / 1"
      data={rates}
      gradient="none"
      xAxisProps={{
        type: "number",
      }}
      yAxisProps={{ padding: { bottom: 2 } }}
      config={{
        xAxisKey: "utilization",
        xAxisFormatter: (value) => t("percent", { value }),
        yAxisFormatter: (value) => t("percent", { value: value * 100 }),
        seriesLabel: t("borrow:utilization.rate"),
        series: [
          {
            key: "variableRate",
            label: t("borrow:market.table.borrowAprVariable"),
            color: VARIABLE_BORROW_RATE_COLOR,
          },
        ],
      }}
      referenceLines={[
        {
          x: Math.round(currentValue * 2) / 2,
          stroke: themeProps.accents.info.onPrimary,
          strokeDasharray: "4 2",
          shapeRendering: "crispEdges",
          label: (props) => (
            <ReferenceLineLabel
              {...props}
              value={currentValue}
              xOffset={currentValue > 50 ? REFERENCE_LABEL_WIDTH + 10 : -5}
              yOffset={30}
              title={t("borrow:utilization.current")}
            />
          ),
        },
        {
          x: Math.round(optimalValue * 2) / 2,
          stroke: themeProps.accents.info.onPrimary,
          strokeDasharray: "4 2",
          shapeRendering: "crispEdges",
          label: (props) => (
            <ReferenceLineLabel
              {...props}
              value={optimalValue}
              xOffset={optimalValue > 50 ? REFERENCE_LABEL_WIDTH + 10 : -5}
              yOffset={5}
              title={t("borrow:utilization.optimal")}
            />
          ),
        },
      ]}
    />
  )
}
