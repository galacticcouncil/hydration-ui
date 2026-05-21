import {
  Box,
  Flex,
  Paper,
  SectionHeader,
  Separator,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { USDC_ASSET_ID, USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { FAKE_STRATEGY } from "@/modules/strategies/stable-bonds/constants"

export const StrategyDetailsCard = () => {
  const { t } = useTranslation("common")
  const strategy = FAKE_STRATEGY

  return (
    <Paper p="l">
      <SectionHeader title="Strategy details" as="h2" noTopPadding />
      <Separator mx="-l" />

      <Flex align="stretch" gap="l" py="l" wrap>
        <Box flex={1}>
          <Text fs="p5" color={getToken("text.medium")}>
            Remaining capacity
          </Text>
          <Flex gap="xl">
            <Flex align="center" gap="base">
              <AssetLogo id={USDC_ASSET_ID} size="small" />
              <Text
                font="primary"
                fs="h6"
                fw={600}
                color={getToken("text.high")}
              >
                {strategy.remainingCapacityUsdc}
              </Text>
            </Flex>
            <Flex align="center" gap="base">
              <AssetLogo id={USDT_ASSET_ID} size="small" />
              <Text
                font="primary"
                fs="h6"
                fw={600}
                color={getToken("text.high")}
              >
                {strategy.remainingCapacityUsdt}
              </Text>
            </Flex>
          </Flex>
        </Box>

        <Separator
          orientation="vertical"
          sx={{ alignSelf: "stretch", display: ["none", null, "block"] }}
        />

        <Box flex={1}>
          <Text fs="p5" color={getToken("text.medium")}>
            Available APR
          </Text>
          <Text
            font="primary"
            fs="h6"
            fw={600}
            color={getToken("accents.success.emphasis")}
            mt="xs"
          >
            {t("percent", {
              value: strategy.availableApr,
              maximumFractionDigits: 1,
            })}
          </Text>
        </Box>

        <Separator
          orientation="vertical"
          sx={{ alignSelf: "stretch", display: ["none", null, "block"] }}
        />

        <Box flex={1}>
          <Text fs="p5" color={getToken("text.medium")}>
            Maturity period
          </Text>
          <Text
            font="primary"
            fs="h6"
            fw={500}
            color={getToken("text.high")}
            mt="xs"
          >
            {strategy.maturityPeriodDays} days
          </Text>
        </Box>
      </Flex>

      <Separator mx="-l" />

      <Box mb="-s" pt="s" asChild>
        <SummaryRow
          label="Funding currency"
          content={
            <Flex align="center" wrap>
              <Flex align="center" gap="xs">
                <AssetLogo id={USDT_ASSET_ID} size="small" />
                <Text fs="p4" lh={1.5}>
                  USDT
                </Text>
              </Flex>
              <Text mr="base">{", "}</Text>
              <Flex align="center" gap="xs">
                <AssetLogo id={USDC_ASSET_ID} size="small" />
                <Text fs="p4" lh={1.5}>
                  USDC
                </Text>
              </Flex>
            </Flex>
          }
        />
      </Box>
    </Paper>
  )
}
