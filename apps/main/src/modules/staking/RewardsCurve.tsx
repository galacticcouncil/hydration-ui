import { CrosshairDot } from "@galacticcouncil/ui/assets/icons"
import {
  AreaChart,
  AxisLabelCssProps,
  Box,
  Flex,
  Grid,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Legend } from "recharts"

import { ChartState } from "@/components/ChartState"
import { useRewardsCurveData } from "@/modules/staking/RewardsCurve.data"

type EllipseProps = {
  readonly className?: string
}

const Ellipse: FC<EllipseProps> = ({ className }) => {
  return (
    <Box
      className={className}
      position="relative"
      width={9}
      height={9}
      borderRadius="full"
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width="50%"
        height="50%"
        transform="translate(-50%, -50%)"
        borderRadius="full"
        bg={getToken("surfaces.containers.mid.primary")}
      />
    </Box>
  )
}

export const RewardsCurve: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { themeProps } = useTheme()

  const { data, isLoading } = useRewardsCurveData()

  const isGraphSecondaryPoint = data.some((value) => value.currentSecondary)

  const labelProps: AxisLabelCssProps = {
    fill: themeProps.text.high,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: 600,
  }

  return (
    <ChartState
      sx={{ height: 190 }}
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <AreaChart
        height={190}
        data={data}
        gradient="line"
        xAxisProps={{
          type: "number",
          tickCount: 8,
          interval: "preserveEnd",
          tickFormatter(value, index) {
            if (index !== 0 && index % 2 === 0) {
              return value
            }
            return ""
          },
        }}
        yAxisProps={{
          type: "number",
          tickCount: 2,
          tickFormatter: (value) => (value ? t("percent", { value }) : ""),
          padding: { bottom: 6 },
        }}
        yAxisLabel={t("staking:dashboard.ofClaimable")}
        yAxisLabelProps={{ ...labelProps, dy: 80 }}
        xAxisLabel={t("days")}
        xAxisLabelProps={{ ...labelProps, dy: -20 }}
        horizontalGridHidden={false}
        verticalGridHidden={false}
        gridHorizontalValues={[(1 / 4) * 100, (2 / 4) * 100, (3 / 4) * 100]}
        strokeWidth={4}
        legend={
          <Legend
            verticalAlign="bottom"
            align="left"
            layout="horizontal"
            content={() => (
              <Flex
                pt={10}
                px={50}
                position="relative"
                align="flex-start"
                gap={2}
              >
                <Flex align="center" gap={4} pt={14}>
                  <Ellipse sx={{ bg: "#53A4F3" }} />
                  <Text fs={14} lh={1.4} color={getToken("text.high")}>
                    {t("staking:dashboard.chart.legend.current")}
                  </Text>
                </Flex>
                {isGraphSecondaryPoint && (
                  <Flex align="center" gap={4} pt={13}>
                    <Ellipse
                      sx={{ bg: getToken("accents.success.emphasis") }}
                    />
                    <Text
                      fs={11}
                      lh={1.4}
                      color={getToken("colors.successGreen.400")}
                    >
                      {t("staking:dashboard.chart.legend.afterVoting")}
                    </Text>
                    <Grid position="absolute" right={8}>
                      <Tooltip
                        text={(
                          t("staking:dashboard.chart.legend.afterVoting.help", {
                            returnObjects: true,
                          }) as Array<string>
                        ).map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      />
                    </Grid>
                  </Flex>
                )}
              </Flex>
            )}
            style={{ marginLeft: 40 }}
          />
        }
        customDot={({ key, payload, cx = 0, cy = 0 }) => (
          <>
            {payload.current && (
              <CrosshairDot
                key={key}
                x={cx - 12}
                y={cy - 7}
                color={themeProps.icons.primary}
              />
            )}
            {payload.currentSecondary && (
              <CrosshairDot
                key={key}
                x={cx - 12}
                y={cy - 6}
                color={themeProps.accents.success.emphasis}
              />
            )}
          </>
        )}
        config={{
          xAxisKey: "x",
          tooltipType: "none",
          series: [
            {
              key: "y",
              color: ["#53A4F3", "#53A4F3", 1, 1],
            },
          ],
        }}
      />
    </ChartState>
  )
}
