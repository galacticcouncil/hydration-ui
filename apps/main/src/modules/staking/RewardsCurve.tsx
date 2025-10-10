import { PlusIcon } from "@galacticcouncil/ui/assets/icons"
import {
  AreaChart,
  Box,
  Flex,
  Grid,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { MOCK_CURVE_DATA } from "@galacticcouncil/ui/components/Chart/utils"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

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

// TODO integrate
export const RewardsCurve: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { themeProps } = useTheme()

  const labelProps = {
    fill: themeProps.text.high,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: 600,
  }

  return (
    <Box width="100%" height={190}>
      <AreaChart
        height={155}
        data={MOCK_CURVE_DATA}
        gradient="line"
        xAxisProps={{
          type: "number",
          tickCount: 4,
          interval: "preserveStartEnd",
        }}
        yAxisProps={{ type: "number", tickCount: 2 }}
        yAxisLabel={t("staking:dashboard.ofClaimable")}
        yAxisLabelProps={labelProps}
        xAxisLabel={t("days")}
        xAxisLabelProps={labelProps}
        strokeWidth={4}
        customDot={({ key, payload, cx = 0, cy = 0 }) => (
          <>
            {payload.current && (
              <PlusIcon key={key} x={cx - 12} y={cy - 12} color="#FFD230" />
            )}
            {payload.currentSecondary && (
              <PlusIcon key={key} x={cx - 12} y={cy - 12} color="#ED6AFF" />
            )}
          </>
        )}
        config={{
          xAxisKey: "x",
          tooltipType: "none",
          series: [
            {
              key: "y",
              color: ["#FC408C", "#53A4F3"],
            },
          ],
        }}
      />
      <Flex position="relative" align="flex-start" justify="center" gap={2}>
        <Flex align="center" gap={4} pt={14}>
          <Ellipse sx={{ bg: "#53A4F3" }} />
          <Text fs={14} lh={1.4} color={getToken("text.high")}>
            {t("staking:dashboard.chart.legend.current")}
          </Text>
        </Flex>
        <Flex align="center" gap={4} pt={13}>
          <Ellipse sx={{ bg: getToken("accents.success.emphasis") }} />
          <Text fs={11} lh={1.4} color={getToken("colors.successGreen.400")}>
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
      </Flex>
    </Box>
  )
}
