import {
  Box,
  BoxProps,
  Flex,
  PieChart,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
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

export const GigaHDXSupplyInfo = () => {
  const { t } = useTranslation(["staking", "common"])
  const { native } = useAssets()
  const { themeProps } = useTheme()

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

  const pieData = [
    {
      value: Number(supplyStakedPercent),
      label: t("gigaStaking.supply.legacy.label"),
      color: themeProps.controls.solid.activeHover,
    },
    {
      value: totalGigaSuppliedPercent,
      label: t("gigaStaking.supply.gigaHdx.label"),
      color: themeProps.text.tint.primary,
    },
  ]

  return (
    <>
      <Text
        font="primary"
        fw={500}
        fs={["p6", "base"]}
        lh={1}
        color={getToken("text.high")}
        px="xl"
      >
        {t("gigaStaking.supply.label")}
      </Text>

      <Flex gap="xl" align="center" p="xl">
        <Flex
          height={[45, 45, 115]}
          width={[45, 45, 115]}
          bg={getToken("details.separatorsOnDim")}
          borderRadius="full"
          justify="center"
          align="center"
        >
          <PieChart
            size={[35, 35, 90]}
            total={100}
            segments={pieData}
            ariaLabel={t("gigaStaking.supply.label")}
            tooltipLabel={t("gigaStaking.supply.label")}
            formatValue={({ value }) => t("common:percent", { value })}
          />
        </Flex>

        <Flex direction="column" gap="s" flex={1}>
          <Stack
            direction={["row", "row", "row", "row"]}
            gap={["xxl", "xxl", "xxl", pxToRem(48), pxToRem(78)]}
            justify={[
              "space-between",
              "space-between",
              "space-between",
              "start",
            ]}
            separated
          >
            <Flex direction="column" gap="xs">
              <LegendItem
                color={getToken("controls.solid.activeHover")}
                label={t("gigaStaking.supply.legacy.label")}
              />

              <Text
                font="primary"
                fs={["h7", "h6"]}
                fw={600}
                lh={1}
                color={getToken("text.high")}
              >
                {t("common:percent", { value: supplyStakedPercent })}
              </Text>

              <Box>
                <Text fs="p6" lh={1.2} color={getToken("text.medium")}>
                  {t("common:currency", {
                    value: supplyStaked,
                    symbol: native.symbol,
                  })}
                </Text>

                <Text fs="p5" lh={1.2} color={getToken("text.medium")}>
                  {t("gigaStaking.supply.liquidity.value", {
                    value: circulatingSupply,
                  })}
                </Text>
              </Box>
            </Flex>

            <Flex direction="column" gap="xs">
              <LegendItem
                color={getToken("text.tint.primary")}
                label={t("gigaStaking.supply.gigaHdx.label")}
              />

              <Text
                font="primary"
                fs={["h7", "h6"]}
                fw={600}
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
        </Flex>
      </Flex>
    </>
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
    <Flex align="center" gap="s">
      <Box bg={color} width="2xs" height="2xs" borderRadius="50%" />
      <Text fs="p6" fw={500} color={getToken("text.high")}>
        {label}
      </Text>
    </Flex>
  )
}
