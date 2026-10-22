import {
  Box,
  Flex,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { LegendItem } from "@/modules/staking/gigaStaking/supplyInfo/GigaHDXSupplyInfo"

export const GigaHDXSupplyInfoSkeleton = () => {
  const { t } = useTranslation("staking")

  return (
    <Flex gap="xl" align="center" p="xl">
      <Flex
        height={[45, 45, 115]}
        width={[45, 45, 115]}
        bg={getToken("details.separatorsOnDim")}
        borderRadius="full"
        justify="center"
        align="center"
      >
        <Box
          size={[35, 35, 90]}
          borderRadius="full"
          bg={getToken("details.separatorsOnDim")}
        />
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
