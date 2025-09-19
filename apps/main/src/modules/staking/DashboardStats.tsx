import { ProjectedAPR, StakedBalance } from "@galacticcouncil/ui/assets/icons"
import { Pie, PieChart } from "@galacticcouncil/ui/components"
import {
  Box,
  Flex,
  Grid,
  Icon,
  Separator,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useAssets } from "@/providers/assetsProvider"

// TODO integrate
const stakingPercentage = 55.5
const circulatedSupply = 4_500_000_000
const projectedAPR = 2.5
const stakedBalance = "229955"

export const DashboardStats: FC = () => {
  const { t } = useTranslation(["common", "staking"])

  const { native } = useAssets()
  const [stakedBalanceDisplay] = useDisplayAssetPrice(native.id, stakedBalance)

  const { themeProps } = useTheme()

  return (
    <Grid
      px={getTokenPx("containers.paddings.primary")}
      py={40}
      columnTemplate="1fr 1fr"
      align="center"
    >
      <Flex
        py={7}
        gap={getTokenPx("containers.paddings.tertiary")}
        align="center"
      >
        <Flex
          height={115}
          width={115}
          p={12}
          bg={getToken("details.separatorsOnDim")}
          borderRadius="full"
          justify="center"
          align="center"
        >
          <PieChart height={90} width={90}>
            <Pie
              data={[{ value: 1 }]}
              innerRadius={15}
              outerRadius={45}
              startAngle={180}
              endAngle={180 - (360 * stakingPercentage) / 100}
              stroke="none"
              fill={themeProps.controls.solid.activeHover}
            />
          </PieChart>
        </Flex>
        <Flex
          direction="column"
          gap={getTokenPx("containers.paddings.quart")}
          maxWidth="min-content"
        >
          <Text
            fw={500}
            fs={10}
            lh={px(12)}
            color={getToken("text.high")}
            whiteSpace="nowrap"
          >
            {t("staking:dashboard.supplyStaked.title", {
              symbol: native.symbol,
            })}
          </Text>
          <Flex direction="column" gap={getTokenPx("scales.paddings.xs")}>
            <Text fw={500} fs={28} lh={px(30)} color={getToken("text.high")}>
              {t("percent", { value: stakingPercentage })}
            </Text>
            <Text fw={400} fs={11} lh={px(15)} color={getToken("text.medium")}>
              <Trans
                t={t}
                i18nKey="staking:dashboard.supplyStaked.ofSupply"
                values={{
                  amount: t("number", { value: circulatedSupply }),
                }}
              >
                <span sx={{ whiteSpace: "nowrap" }} />
              </Trans>
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex direction="column" gap={getTokenPx("containers.paddings.tertiary")}>
        <Flex gap={9} align="center">
          <Icon component={ProjectedAPR} size={50} />
          <Flex direction="column" gap={3}>
            <Flex gap={4} align="center">
              <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
                {t("staking:dashboard.projectedAPR")}
              </Text>
              <Tooltip text="TODO" />
            </Flex>
            <Text fw={500} fs="h7" lh={1} color={getToken("text.high")}>
              {t("percent", { value: projectedAPR })}
            </Text>
          </Flex>
        </Flex>
        <Separator />
        <Flex gap={10} align="center">
          <Icon component={StakedBalance} size={50} />
          <Flex direction="column" gap={10}>
            <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
              {t("staking:dashboard.balance")}
            </Text>
            <Box>
              <Text fw={500} fs={17.5} lh={1} color={getToken("text.high")}>
                {t("currency", {
                  value: stakedBalance,
                  symbol: native.symbol,
                })}
              </Text>
              <Text fs={12} lh={1} color={getToken("text.medium")}>
                ≈{stakedBalanceDisplay}
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Grid>
  )
}
