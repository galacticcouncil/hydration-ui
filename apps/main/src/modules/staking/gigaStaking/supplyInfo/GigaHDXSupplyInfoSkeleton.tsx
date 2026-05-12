import {
  Flex,
  Pie,
  PieChart,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  LegendItem,
  PIE_START_ANGLE,
} from "@/modules/staking/gigaStaking/supplyInfo/GigaHDXSupplyInfo"

export const GigaHDXSupplyInfoSkeleton = () => {
  const { t } = useTranslation("staking")

  return (
    <Flex gap="xl" align="center" p="xl">
      <Flex
        height={pxToRem(115)}
        width={pxToRem(115)}
        p="m"
        bg={getToken("details.separatorsOnDim")}
        borderRadius="full"
        justify="center"
        align="center"
      >
        <PieChart height={90} width={90} sx={{ pointerEvents: "none" }}>
          <Pie
            data={[]}
            dataKey="value"
            nameKey="name"
            innerRadius={15}
            outerRadius={45}
            startAngle={PIE_START_ANGLE}
            endAngle={PIE_START_ANGLE - 360}
            stroke="none"
          />
        </PieChart>
      </Flex>

      <Flex direction="column" gap="s" sx={{ minWidth: 0 }}>
        <Text fs="p6" fw={500} color={getToken("text.high")}>
          {t("gigaStaking.supply.label")}
        </Text>

        <Stack
          direction={["column", "column", "column", "row"]}
          gap={["xxl", null]}
          justify="start"
          separated
        >
          <Flex direction="column" gap="xs">
            <LegendItem
              color={getToken("text.tint.secondary")}
              label={t("gigaStaking.supply.legacy.label")}
            />

            <Text
              font="primary"
              fs="h7"
              fw={500}
              lh={1}
              color={getToken("text.high")}
            >
              <Skeleton width={100} />
            </Text>

            <Text fs="p6" color={getToken("text.medium")}>
              <Skeleton width={100} />
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
              <Skeleton width={100} />
            </Text>

            <Text fs="p6" color={getToken("text.medium")}>
              <Skeleton width={100} />
            </Text>
          </Flex>
        </Stack>

        <Text fs="p5" color={getToken("text.high")}>
          <Skeleton width={100} />
        </Text>
      </Flex>
    </Flex>
  )
}
