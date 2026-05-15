import {
  Box,
  BoxProps,
  Flex,
  Pie,
  PieChart,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints, useTheme } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { gigaTotalLockedQuery } from "@/api/gigaStake"
import { useStakingSupply } from "@/modules/staking/DashboardStats.data"
import { GigaHDXSupplyInfoSkeleton } from "@/modules/staking/gigaStaking/supplyInfo/GigaHDXSupplyInfoSkeleton"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const PIE_START_ANGLE = 90

export const GigaHDXSupplyInfo = () => {
  const { t } = useTranslation(["staking", "common"])
  const { native } = useAssets()
  const { themeProps } = useTheme()
  const { isMobile, isTablet } = useBreakpoints()

  const {
    supplyStaked,
    supplyStakedPercent,
    circulatingSupply,
    isLoading: isSupplyLoading,
  } = useStakingSupply()

  const { data: gigaLockedHDX, isLoading: isGigaLockedHDXLoading } = useQuery(
    gigaTotalLockedQuery(useRpcProvider()),
  )

  if (isSupplyLoading || isGigaLockedHDXLoading) {
    return <GigaHDXSupplyInfoSkeleton />
  }

  const totalGigaSupplied = scaleHuman(gigaLockedHDX ?? 0n, native.decimals)
  const totalGigaSuppliedPercent = Big(totalGigaSupplied)
    .div(circulatingSupply)
    .mul(100)
    .toNumber()

  const totalShare = totalGigaSuppliedPercent + Number(supplyStakedPercent)
  const remainingShare = Math.max(0, 100 - totalShare)

  const pieData = [
    {
      name: "Legacy",
      value: Number(supplyStakedPercent),
      fill: themeProps.controls.solid.activeHover,
    },
    {
      name: "GIGAHDX",
      value: totalGigaSuppliedPercent,
      fill: themeProps.text.tint.primary,
    },
    ...(remainingShare > 0
      ? [
          {
            name: "Remaining",
            value: remainingShare,
            fill: "transparent",
          },
        ]
      : []),
  ]

  return (
    <Flex gap="xl" align="start" p="xl">
      <Flex
        height={[45, 45, 115]}
        width={[45, 45, 115]}
        bg={getToken("details.separatorsOnDim")}
        borderRadius="full"
        justify="center"
        align="center"
      >
        <PieChart
          height={isMobile || isTablet ? 35 : 90}
          width={isMobile || isTablet ? 35 : 90}
          sx={{ pointerEvents: "none" }}
        >
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={isMobile || isTablet ? 7 : 25}
            outerRadius={isMobile || isTablet ? 15 : 45}
            startAngle={PIE_START_ANGLE}
            endAngle={PIE_START_ANGLE - 360}
            stroke="none"
          />
        </PieChart>
      </Flex>

      <Flex direction="column" gap="s" flex={1}>
        <Text fs="p6" fw={500} color={getToken("text.high")}>
          {t("gigaStaking.supply.label")}
        </Text>

        <Stack
          direction={["row", "row", "row", "row"]}
          gap={["xxl", "xxl", "xxl", pxToRem(48), pxToRem(78)]}
          justify={["space-between", "space-between", "space-between", "start"]}
          separated
        >
          <Flex direction="column" gap="xs">
            <LegendItem
              color={getToken("controls.solid.activeHover")}
              label={t("gigaStaking.supply.legacy.label")}
            />

            <Text
              font="primary"
              fs="h7"
              fw={500}
              lh={1}
              color={getToken("text.high")}
            >
              {t("common:percent", { value: supplyStakedPercent })}
            </Text>

            <Text fs="p6" color={getToken("text.medium")}>
              {t("common:currency", {
                value: supplyStaked,
                symbol: native.symbol,
              })}
            </Text>
          </Flex>

          <Flex direction="column" gap="xs">
            <LegendItem
              color={getToken("text.tint.primary")}
              label={t("gigaStaking.supply.gigaHdx.label")}
            />

            <Text
              font="primary"
              fs="h7"
              fw={500}
              lh={1}
              color={getToken("text.high")}
            >
              {t("common:percent", { value: totalGigaSuppliedPercent })}
            </Text>

            <Text fs="p6" color={getToken("text.medium")}>
              {t("common:currency", {
                value: totalGigaSupplied,
                symbol: native.symbol,
              })}
            </Text>
          </Flex>
        </Stack>

        <Text fs="p5" color={getToken("text.high")}>
          {t("gigaStaking.supply.liquidity.value", {
            value: circulatingSupply,
          })}
        </Text>
      </Flex>
    </Flex>
  )
}

export const LegendItem = ({
  color,
  label,
}: {
  color: BoxProps["bg"]
  label: string
}) => {
  return (
    <Flex align="center" gap="xs">
      <Box
        bg={color}
        width={pxToRem(10)}
        height={pxToRem(10)}
        borderRadius="50%"
      />
      <Text fs="p6" fw={500} color={getToken("text.high")}>
        {label}
      </Text>
    </Flex>
  )
}
