import { MoveUpRight } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ExternalLink,
  Flex,
  Grid,
  Icon,
  Paper,
  Separator,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  DCL_ASSET_ID,
  HOLLAR_ASSET_ID,
  HYDRATION_CHAIN_KEY,
  shortenAccountAddress,
  subscan,
} from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { VAULT_ADDRESS } from "@/modules/strategies/hdcl/constants"
import { HdclStrategyMetrics } from "@/modules/strategies/hdcl/hooks/useHdclStrategyMetrics"

type StrategyDetailsCardProps = {
  metrics: HdclStrategyMetrics
}

export const StrategyDetailsCard: React.FC<StrategyDetailsCardProps> = ({
  metrics,
}) => {
  const { t } = useTranslation(["strategies", "borrow", "common"])
  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("details.title")}
        </Text>
      </Box>
      <Separator />

      <Flex justify="space-between" gap="l" p="l" wrap>
        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("hdcl.strategy.tvl")}
          </Text>
          <Flex align="center" gap="s" mt="xs">
            <AssetLogo id={DCL_ASSET_ID} size="medium" />
            <Text font="primary" fs="h6" fw={600} color={getToken("text.high")}>
              {t("common:currency.compact", { value: metrics.tvl })}
            </Text>
          </Flex>
        </Box>
        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("hdcl.strategy.maxNetApy")}
          </Text>
          <Text
            font="primary"
            fs="h6"
            fw={600}
            color={getToken("accents.success.emphasis")}
            mt="xs"
          >
            {t("common:percent", {
              value: metrics.maxNetApyPct,
              maximumFractionDigits: 1,
            })}
          </Text>
        </Box>
        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("hdcl.strategy.yieldCycle")}
          </Text>
          <Text
            font="primary"
            fs="h6"
            fw={500}
            color={getToken("text.high")}
            mt="xs"
          >
            {t("hdcl.strategy.yieldCycleValue")}
          </Text>
        </Box>
      </Flex>

      <Separator />

      <Grid columnGap="l" columnTemplate={["1fr", null, null, "1fr 1fr"]} p="l">
        <Summary withTrailingSeparator justify="flex-start">
          <SummaryRow
            label={t("hdcl.strategy.collateralAssetLabel")}
            content={
              <Flex align="center" gap="s">
                <AssetLogo id={DCL_ASSET_ID} size="small" />
                <Text fs="p4" lh={1.5}>
                  {t("hdcl.strategy.collateralAsset")}
                </Text>
              </Flex>
            }
          />
          <SummaryRow
            label={t("hdcl.strategy.debtAssetLabel")}
            content={
              <Flex align="center" gap="s">
                <AssetLogo id={HOLLAR_ASSET_ID} size="small" />
                <Text fs="p4" lh={1.5}>
                  {t("hdcl.strategy.debtAsset")}
                </Text>
              </Flex>
            }
          />
          <SummaryRow
            label={t("hdcl.strategy.contractAddress")}
            content={
              <Text fs="p4" lh={1.5}>
                <ExternalLink
                  href={subscan.account(HYDRATION_CHAIN_KEY, VAULT_ADDRESS)}
                >
                  {shortenAccountAddress(VAULT_ADDRESS)}
                  <Icon component={MoveUpRight} size="xs" />
                </ExternalLink>
              </Text>
            }
          />
        </Summary>
        <Summary withTrailingSeparator justify="flex-start">
          <SummaryRow
            label={t("borrow:maxLTV")}
            content={
              <Text fs="p4" lh={1.5}>
                {t("common:percent", {
                  value: metrics.maxLtvPct,
                  minimumFractionDigits: 0,
                })}
              </Text>
            }
          />
          <SummaryRow
            label={t("hdcl.strategy.liquidationLtv")}
            content={
              <Text fs="p4" lh={1.5}>
                {t("common:percent", {
                  value: metrics.liquidationLtvPct,
                  minimumFractionDigits: 0,
                })}
              </Text>
            }
          />
        </Summary>
      </Grid>
    </Paper>
  )
}
