import { MoveUpRight } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ExternalLink,
  Flex,
  Icon,
  Paper,
  ProgressBar,
  ResponsiveScope,
  Separator,
  SummaryRow,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  HYDRATION_CHAIN_KEY,
  shortenAccountAddress,
  subscan,
} from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  SDetailsContainer,
  SStatItem,
} from "@/modules/strategies/propeller/components/StrategyDetailsCard.styled"
import { usePropellerApy } from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"
import { PROPELLER_RISK_PROFILE } from "@/modules/strategies/propeller/vaults"
import { useAssetPrice } from "@/states/displayAsset"

interface VaultStats {
  /** vault size, denominated in the collateral */
  totalAssets: number
  /** deposit ceiling, denominated in the collateral; 0 until the query loads */
  tvlCap: number
}

interface Props {
  vaultStats: VaultStats
}

export const StrategyDetailsCard = ({ vaultStats }: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const vault = useActivePropellerVault()
  const { price } = useAssetPrice(vault.assetId)
  // live leveraged carry (Kamino PRIME yield − HOLLAR borrow); null unless
  // positive — we never surface a 0% or negative APY.
  const apr = usePropellerApy()

  const { totalAssets, tvlCap } = vaultStats
  // totalAssets is denominated in the collateral (the underlying).
  const tvlDisplay = totalAssets * Number(price || 0)
  // The contract reverts when totalAssets + assets > tvlCap, so the headroom
  // is exactly tvlCap − totalAssets. A cap of 0 is the pre-load default, not a
  // vault with no room — hide the stat until it resolves.
  const hasCap = tvlCap > 0
  const remainingCapacity = Math.max(tvlCap - totalAssets, 0)
  const remainingPct = hasCap ? (remainingCapacity / tvlCap) * 100 : 0

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("strategy.title")}
        </Text>
      </Box>
      <Separator />

      <ResponsiveScope>
        <SDetailsContainer>
          <SStatItem>
            <ValueStats
              wrap
              label={t("strategy.tvl")}
              customValue={
                <Text
                  font="primary"
                  fs="h6"
                  fw={600}
                  color={getToken("text.high")}
                >
                  {t("common:currency.compact", { value: tvlDisplay })}
                </Text>
              }
            />
          </SStatItem>

          {hasCap && (
            <SStatItem>
              <Text fs="p5" color={getToken("text.medium")}>
                {t("strategy.remainingCapacity")}
              </Text>
              <Flex align="center" gap="s" mt="xs">
                <AssetLogo id={vault.assetId} size="medium" />
                <Text
                  font="primary"
                  fs="h6"
                  fw={600}
                  color={getToken("text.high")}
                >
                  {t("common:currency.compact", {
                    value: remainingCapacity,
                    symbol: vault.symbol,
                    maximumFractionDigits: remainingCapacity > 100_000 ? 0 : 2,
                  })}
                </Text>
              </Flex>
              <Box mt="xs" sx={{ maxWidth: 200 }}>
                <ProgressBar size="small" value={remainingPct} />
              </Box>
            </SStatItem>
          )}

          <SStatItem>
            <ValueStats
              wrap
              label={t("strategy.netApy")}
              customValue={
                <Text
                  font="primary"
                  fs="h6"
                  fw={600}
                  color={getToken(
                    apr === null ? "text.high" : "accents.success.emphasis",
                  )}
                >
                  {apr === null
                    ? "—"
                    : t("common:percent", {
                        prefix: "+",
                        value: apr,
                        maximumFractionDigits: 2,
                      })}
                </Text>
              }
            />
          </SStatItem>

          <SStatItem>
            <ValueStats
              wrap
              label={t("strategy.riskProfile")}
              customValue={
                <Text
                  font="primary"
                  fs="h6"
                  fw={600}
                  color={getToken("text.high")}
                >
                  {t(`strategy.risk.${PROPELLER_RISK_PROFILE}`)}
                </Text>
              }
            />
          </SStatItem>
        </SDetailsContainer>
      </ResponsiveScope>

      <Separator />

      <Box p="l">
        <SummaryRow
          label={t("strategy.contractAddress")}
          content={
            <Text fs="p4" lh={1.5}>
              <ExternalLink
                href={subscan.account(HYDRATION_CHAIN_KEY, vault.vaultAddress)}
              >
                {shortenAccountAddress(vault.vaultAddress)}
                <Icon component={MoveUpRight} size="xs" />
              </ExternalLink>
            </Text>
          }
        />
      </Box>
    </Paper>
  )
}
