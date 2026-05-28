import { MoveUpRight } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ExternalLink,
  Flex,
  Grid,
  Icon,
  Paper,
  SectionHeader,
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
import { STRATEGY, VAULT_ADDRESS } from "@/modules/strategies/hdcl/constants"
import { useHdclReserveConfig } from "@/modules/strategies/hdcl/hooks/useHdclPoolPosition"

interface VaultStats {
  totalAssets: number
  exchangeRate: number
  apr: number
}

interface Props {
  vaultStats: VaultStats
}

export const StrategyDetailsCard = ({ vaultStats }: Props) => {
  const { t } = useTranslation(["hdcl", "common"])
  const tvl = vaultStats.totalAssets * vaultStats.exchangeRate
  const { data: reserveConfig } = useHdclReserveConfig()
  const maxLtvPct = reserveConfig?.maxLtvPct ?? STRATEGY.maxLtvPct
  const liqLtvPct =
    reserveConfig?.liquidationThresholdPct ?? STRATEGY.liquidationLtvPct

  // "Max Net APY" = the leveraged yield an idealized user achieves at max LTV.
  //   L = 1 / (1 − LTV)
  //   netApy = L × vault_apy − (L − 1) × borrow_apy
  // vaultStats.apr is named historically but actually carries vault APY in %
  // (see useVaultReads: getAPYWad / 1e16). Falls back to the raw vault yield
  // until the borrow rate query lands.
  const vaultApyPct = vaultStats.apr
  const borrowApyPct = reserveConfig?.borrowApyPct ?? 10
  const maxLeverage = maxLtvPct < 100 ? 100 / (100 - maxLtvPct) : 1
  const maxNetApyPct =
    maxLeverage * vaultApyPct - (maxLeverage - 1) * borrowApyPct

  return (
    <Paper p="l">
      <SectionHeader title={t("strategy.title")} as="h2" noTopPadding />

      <Flex justify="space-between" gap="l" mb="l" wrap>
        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("strategy.tvl")}
          </Text>
          <Flex align="center" gap="s" mt="xs">
            <DecentralLogo size={28} />
            <Text font="primary" fs="h6" fw={600} color={getToken("text.high")}>
              {t("common:currency.compact", { value: tvl })}
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
              prefix: "+",
              value: maxNetApyPct,
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

      <Grid columnGap="l" columnTemplate={["1fr", null, "1fr 1fr"]}>
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
                  value: maxLtvPct,
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
                  value: liqLtvPct,
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
