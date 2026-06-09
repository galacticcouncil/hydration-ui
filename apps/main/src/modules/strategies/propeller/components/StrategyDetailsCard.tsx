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
  HYDRATION_CHAIN_KEY,
  shortenAccountAddress,
  subscan,
} from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { PropellerLogo } from "@/modules/strategies/propeller/components/PropellerLogo"
import {
  usePropellerApy,
  useSubLoopStats,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"

interface VaultStats {
  totalAssets: number
  exchangeRate: number
  apr: number
}

interface Props {
  vaultStats: VaultStats
}

export const StrategyDetailsCard = ({ vaultStats }: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const vault = useActivePropellerVault()
  // totalAssets is denominated in the collateral (the underlying); display directly.
  const tvl = vaultStats.totalAssets
  const { data: subLoop } = useSubLoopStats()
  const healthFactor = subLoop?.healthFactor ?? null
  const targetHf = subLoop?.targetHf ?? null
  const leverage = subLoop?.leverage ?? null
  // live leveraged carry (Kamino PRIME yield − HOLLAR borrow); null unless
  // positive — we never surface a 0% or negative APY.
  const apr = usePropellerApy()

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
            <PropellerLogo size={28} />
            <Text font="primary" fs="h6" fw={600} color={getToken("text.high")}>
              {t("common:currency", {
                value: tvl,
                symbol: vault.symbol,
                maximumFractionDigits: 2,
              })}
            </Text>
          </Flex>
        </Box>
        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("strategy.netApy")}
          </Text>
          <Text
            font="primary"
            fs="h6"
            fw={600}
            color={getToken(
              apr === null ? "text.high" : "accents.success.emphasis",
            )}
            mt="xs"
          >
            {apr === null
              ? "—"
              : t("common:percent", {
                  prefix: "+",
                  value: apr,
                  maximumFractionDigits: 2,
                })}
          </Text>
        </Box>
        <Box>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("strategy.healthFactor")}
          </Text>
          <Flex align="baseline" gap="xs" mt="xs">
            <Text font="primary" fs="h6" fw={500} color={getToken("text.high")}>
              {healthFactor === null
                ? "—"
                : t("common:number", {
                    value: healthFactor,
                    maximumFractionDigits: 2,
                  })}
            </Text>
            {healthFactor !== null && targetHf !== null && (
              <Text fs="p4" color={getToken("text.medium")}>
                {"→ "}
                {t("common:number", {
                  value: targetHf,
                  maximumFractionDigits: 2,
                })}
              </Text>
            )}
          </Flex>
          {leverage !== null && (
            <Text fs="p5" color={getToken("text.medium")} mt="xs">
              {t("strategy.leverage", {
                value: t("common:number", {
                  value: leverage,
                  maximumFractionDigits: 2,
                }),
              })}
            </Text>
          )}
        </Box>
      </Flex>

      <Separator />

      <Grid columnGap="l" columnTemplate={["1fr", null, "1fr 1fr"]} p="l">
        <Box>
          <SummaryRow
            label={t("strategy.collateralAssetLabel")}
            content={
              <Flex align="center" gap="xs">
                <AssetLogo id={vault.assetId} size="small" />
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
            label={t("strategy.yieldCycle")}
            content={
              <Text fs="p4" lh={1.5}>
                {t("strategy.yieldCycleValue")}
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
                  href={subscan.account(
                    HYDRATION_CHAIN_KEY,
                    vault.vaultAddress,
                  )}
                >
                  {shortenAccountAddress(vault.vaultAddress)}
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
