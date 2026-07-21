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
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  BIL_ASSET_ID,
  HOLLAR_ASSET_ID,
  HYDRATION_CHAIN_KEY,
  shortenAccountAddress,
  subscan,
} from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { VAULT_ADDRESS } from "@/modules/strategies/bil/constants"
import { BilStrategyMetrics } from "@/modules/strategies/bil/hooks/useBilStrategyMetrics"

type StrategyDetailsCardProps = {
  metrics: BilStrategyMetrics
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

      <Flex gap={["l", null, "xxxl"]} p="l" wrap>
        <ValueStats
          sx={{ alignSelf: "center" }}
          wrap
          label={t("bil.strategy.tvl")}
          customValue={
            <Flex align="center" gap="s">
              <AssetLogo id={BIL_ASSET_ID} size="medium" />
              <Text
                font="primary"
                fs="h6"
                fw={600}
                color={getToken("text.high")}
              >
                {t("common:currency.compact", { value: metrics.tvl })}
              </Text>
            </Flex>
          }
        />
        <Separator orientation="vertical" sx={{ alignSelf: "stretch" }} />
        <ValueStats
          sx={{ alignSelf: "center" }}
          wrap
          label={t("bil.strategy.maxNetApy")}
          customValue={
            <Text
              font="primary"
              fs="h6"
              fw={600}
              color={getToken("accents.success.emphasis")}
            >
              {t("common:percent", {
                value: metrics.maxNetApyPct,
                maximumFractionDigits: 1,
              })}
            </Text>
          }
        />
      </Flex>

      <Separator />

      <Grid columnGap="l" columnTemplate={["1fr", null, null, "1fr 1fr"]} p="l">
        <Summary withTrailingSeparator justify="flex-start">
          <SummaryRow
            label={t("bil.strategy.collateralAssetLabel")}
            content={
              <Flex align="center" gap="s">
                <AssetLogo id={BIL_ASSET_ID} size="small" />
                <Text fs="p4" lh={1.5}>
                  {t("bil.strategy.collateralAsset")}
                </Text>
              </Flex>
            }
          />
          <SummaryRow
            label={t("bil.strategy.debtAssetLabel")}
            content={
              <Flex align="center" gap="s">
                <AssetLogo id={HOLLAR_ASSET_ID} size="small" />
                <Text fs="p4" lh={1.5}>
                  {t("bil.strategy.debtAsset")}
                </Text>
              </Flex>
            }
          />
          <SummaryRow
            label={t("bil.strategy.contractAddress")}
            content={
              <Text fs="p4" lh={1.5} whiteSpace="nowrap">
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
            label={t("bil.strategy.liquidationLtv")}
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
