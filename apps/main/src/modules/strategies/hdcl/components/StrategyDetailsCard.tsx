import { MoveUpRight } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ExternalLink,
  Flex,
  Grid,
  Icon,
  Paper,
  Separator,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  HOLLAR_ASSET_ID,
  HYDRATION_CHAIN_KEY,
  shortenAccountAddress,
  subscan,
} from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { DecentralLogo } from "@/modules/strategies/hdcl/components/DecentralLogo"
import { VAULT_ADDRESS } from "@/modules/strategies/hdcl/constants"
import { HdclStrategyMetrics } from "@/modules/strategies/hdcl/hooks/useHdclStrategyMetrics"

type StrategyDetailsCardProps = {
  metrics: HdclStrategyMetrics
}

export const StrategyDetailsCard: React.FC<StrategyDetailsCardProps> = ({
  metrics,
}) => {
  const { t } = useTranslation(["hdcl", "common"])
  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("strategy.title")}
        </Text>
      </Box>
      <Separator />

      <Flex justify="space-between" gap="l" mb="l" p="l" wrap>
        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("strategy.tvl")}
          </Text>
          <Flex align="center" gap="s" mt="xs">
            <DecentralLogo size={28} />
            <Text font="primary" fs="h6" fw={600} color={getToken("text.high")}>
              {t("common:currency.compact", { value: metrics.tvl })}
            </Text>
          </Flex>
        </Box>
        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("strategy.maxNetApy")}
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
            {t("strategy.yieldCycle")}
          </Text>
          <Text
            font="primary"
            fs="h6"
            fw={500}
            color={getToken("text.high")}
            mt="xs"
          >
            {t("strategy.yieldCycleValue")}
          </Text>
        </Box>
      </Flex>

      <Separator />

      <Grid columnGap="l" columnTemplate={["1fr", null, "1fr 1fr"]} p="l">
        <Box>
          <SummaryRow
            label={t("strategy.collateralAssetLabel")}
            content={
              <Flex align="center" gap="xs">
                <DecentralLogo size={20} />
                <Text fs="p4" lh={1.5}>
                  {t("strategy.collateralAsset")}
                </Text>
              </Flex>
            }
          />
          <Separator />
        </Box>
        <Box>
          <SummaryRow
            label={t("strategy.maxLtv")}
            content={
              <Text fs="p4" lh={1.5}>
                {t("common:percent", {
                  value: metrics.maxLtvPct,
                  minimumFractionDigits: 1,
                })}
              </Text>
            }
          />
          <Separator />
        </Box>
        <Box>
          <SummaryRow
            label={t("strategy.debtAssetLabel")}
            content={
              <Flex align="center" gap="xs">
                <AssetLogo id={HOLLAR_ASSET_ID} size="small" />
                <Text fs="p4" lh={1.5}>
                  {t("strategy.debtAsset")}
                </Text>
              </Flex>
            }
          />
          <Separator />
        </Box>
        <Box>
          <SummaryRow
            label={t("strategy.liquidationLtv")}
            content={
              <Text fs="p4" lh={1.5}>
                {t("common:percent", {
                  value: metrics.liquidationLtvPct,
                  minimumFractionDigits: 1,
                })}
              </Text>
            }
          />
          <Separator />
        </Box>
        <Box>
          <SummaryRow
            label={t("strategy.contractAddress")}
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
          <Separator />
        </Box>
      </Grid>
    </Paper>
  )
}
