import { Ellipse } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Chart,
  Flex,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { defineChart, dot, lineY, ruleY } from "@tanstack/charts"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { ChartState } from "@/components/ChartState"
import { useRewardsCurveData } from "@/modules/staking/RewardsCurve.data"
import { useIncreaseStake } from "@/modules/staking/Stake.utils"

const CHART_HEIGHT = 190
const STROKE_WIDTH = 1.5
const DOT_RADIUS = 6
const GRID_VALUES = [(1 / 4) * 100, (2 / 4) * 100, (3 / 4) * 100]

export const RewardsCurve: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { themeProps } = useTheme()

  const { data, isLoading } = useRewardsCurveData()
  const diffDays = useIncreaseStake((state) => state.diffDays)

  const isGraphSecondaryPoint = data.some((value) => value.currentSecondary)

  const isGraphIncreasePoint =
    data?.find((value) => value.currentThird) && diffDays !== "0"

  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          ruleY(GRID_VALUES, {
            stroke: themeProps.controls.outline.base,
            strokeOpacity: 0.75,
            strokeDasharray: "2 3",
          }),
          lineY(data, {
            x: "x",
            y: "y",
            stroke: themeProps.controls.outline.active,
            strokeWidth: STROKE_WIDTH,
            strokeDasharray: "4 1.5",
          }),
          dot(
            data.filter(({ current }) => current),
            {
              x: "x",
              y: "y",
              r: DOT_RADIUS,
              fill: themeProps.icons.primary,
            },
          ),
          dot(
            data.filter(({ currentSecondary }) => currentSecondary),
            {
              x: "x",
              y: "y",
              r: DOT_RADIUS,
              fill: themeProps.accents.success.emphasis,
            },
          ),
          dot(
            data.filter(({ currentThird }) => currentThird),
            {
              x: "x",
              y: "y",
              r: DOT_RADIUS,
              fill: themeProps.buttons.secondary.emphasis.onRest,
            },
          ),
        ],
        x: {
          scale: scaleLinear,
          grid: true,
          axis: {
            line: false,
            ticks: { count: 10, size: 0, padding: 8 },
            tickLabels: { thin: true },
            label: t("days"),
          },
        },
        y: {
          scale: scaleLinear,
          axis: {
            line: false,
            ticks: {
              count: 2,
              size: 0,
              padding: 8,
              format: (value) => (value ? t("percent", { value }) : ""),
            },
            label: t("staking:dashboard.ofClaimable"),
          },
        },
      }),
    [data, themeProps, t],
  )

  return (
    <Box
      mb={30}
      height={CHART_HEIGHT}
      width="100%"
      sx={{ position: "relative" }}
    >
      <ChartState
        sx={{ height: CHART_HEIGHT }}
        isLoading={isLoading}
        isEmpty={!data.length}
      >
        <Flex
          gap="m"
          align="center"
          sx={{ position: "absolute", top: 10, right: 0 }}
        >
          {isGraphIncreasePoint && (
            <Flex align="center" gap="s">
              <Ellipse
                sx={{
                  color: getToken("buttons.secondary.emphasis.onRest"),
                }}
              />
              <Text
                fs="p6"
                lh={1.4}
                color={getToken("buttons.secondary.emphasis.onRest")}
                whiteSpace="nowrap"
              >
                {t("staking:dashboard.chart.legend.afterIncrease")}
              </Text>
            </Flex>
          )}
          {isGraphSecondaryPoint && (
            <Flex align="center" gap="s">
              <Ellipse sx={{ color: getToken("accents.success.emphasis") }} />
              <Text
                fs="p6"
                lh={1.4}
                color={getToken("colors.successGreen.400")}
                whiteSpace="nowrap"
              >
                {t("staking:dashboard.chart.legend.afterVoting")}
              </Text>
              <Tooltip
                asChild
                text={(
                  t("staking:dashboard.chart.legend.afterVoting.help", {
                    returnObjects: true,
                  }) as Array<string>
                ).map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              >
                <TooltipIcon color={getToken("accents.success.emphasis")} />
              </Tooltip>
            </Flex>
          )}
          <Flex align="center" gap="s">
            <Ellipse sx={{ color: getToken("icons.Contrast-") }} />
            <Text
              fs="p6"
              lh={1.4}
              color={getToken("text.high")}
              whiteSpace="nowrap"
            >
              {t("staking:dashboard.chart.legend.current")}
            </Text>
          </Flex>
        </Flex>
        <Chart
          definition={definition}
          ariaLabel={t("staking:dashboard.ofClaimable")}
          height={CHART_HEIGHT}
        />
      </ChartState>
    </Box>
  )
}
