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
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useStableBondsOtcOrders } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.query"
import { FAKE_STRATEGY } from "@/modules/strategies/stable-bonds/constants"
import type { TAsset } from "@/providers/assetsProvider"

type FundingCapacity = {
  readonly asset: TAsset
  readonly amount: string
}

export const StrategyDetailsCard = () => {
  const { t } = useTranslation("common")
  const strategy = FAKE_STRATEGY
  const { data: otcOrders = [] } = useStableBondsOtcOrders()

  const fundingCapacities = useMemo(() => {
    const byAssetId = otcOrders.reduce<Map<string, FundingCapacity>>(
      (acc, order) => {
        const current = acc.get(order.assetIn.id)

        acc.set(order.assetIn.id, {
          asset: order.assetIn,
          amount: current
            ? Big(current.amount).plus(order.assetAmountIn).toString()
            : order.assetAmountIn,
        })

        return acc
      },
      new Map(),
    )

    return [...byAssetId.values()]
  }, [otcOrders])

  return (
    <Paper p="l">
      <SectionHeader title="Strategy details" as="h2" noTopPadding />
      <Separator mx="-l" />

      <Flex align="stretch" gap={["xl", null, "xxxl"]} py="l" wrap>
        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            Remaining capacity
          </Text>
          <Flex gap="xl">
            {fundingCapacities.map(({ asset, amount }) => (
              <Flex key={asset.id} align="center" gap="base">
                <AssetLogo id={asset.id} size="small" />
                <Text
                  font="primary"
                  fs="h6"
                  fw={600}
                  color={getToken("text.high")}
                >
                  {t("number", { value: amount })}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>

        <Separator
          orientation="vertical"
          sx={{ alignSelf: "stretch", display: ["none", null, "block"] }}
        />

        <Box>
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

        <Box>
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
              {fundingCapacities.map(({ asset }, index) => (
                <Flex key={asset.id} align="center" wrap>
                  {index > 0 && <Text mr="base">{", "}</Text>}
                  <Flex align="center" gap="xs">
                    <AssetLogo id={asset.id} size="small" />
                    <Text fs="p4" lh={1.5}>
                      {asset.symbol}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          }
        />
      </Box>
    </Paper>
  )
}
