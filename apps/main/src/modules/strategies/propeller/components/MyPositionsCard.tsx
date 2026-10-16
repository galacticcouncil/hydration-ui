import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  PositionCard,
  Stack,
  Text,
  Tooltip,
  TooltipIcon,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { AssetLogo } from "@/components/AssetLogo"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { type PropellerPosition } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { useAssets } from "@/providers/assetsProvider"

interface Props {
  positions: PropellerPosition[]
  onWithdraw: (vault: PropellerVaultConfig) => void
}

export const MyPositionsCard = ({ positions, onWithdraw }: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const { getAssetWithFallback } = useAssets()

  if (!positions.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("positions.title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <Stack gap="m">
          {positions.map(
            ({
              vault,
              shares,
              assetValue,
              usdValue,
              apy,
              accrualPaused,
              pendingYield,
              harvestStatus,
            }) => {
              const { symbol } = getAssetWithFallback(vault.assetId)
              // demoted: a six-decimal dust figure as a headline stat reads as
              // broken; the accruing amount lives in the tooltip, the sublabel
              // just says the position is earning (dust-floored)
              const accruing =
                pendingYield !== null && pendingYield > assetValue * 1e-6
                  ? pendingYield
                  : null
              const harvestState = harvestStatus?.state ?? "unavailable"
              const harvestBlocked =
                harvestStatus !== null && harvestState !== "awaiting"
              const harvestExplanation = t(
                `positions.harvest.${harvestState}.description`,
                {
                  gap: Number(formatUnits(harvestStatus?.reserveGap ?? 0n, 18)),
                  minimum: Number(
                    formatUnits(harvestStatus?.minimumSurplus ?? 0n, 18),
                  ),
                },
              )

              return (
                <PositionCard
                  key={vault.vaultAddress}
                  columns={`repeat(auto-fit, minmax(min(100%, ${pxToRem(176)}), 1fr))`}
                  logo={
                    <AssetLogo id={vault.assetId} size="medium" hideChain />
                  }
                  symbol={symbol}
                  stats={
                    <>
                      <ValueStats
                        wrap
                        size="small"
                        font="secondary"
                        label={t("positions.col.amount")}
                        customValue={
                          <Flex gap="xs" align="center">
                            <Text fs="p3" fw={500} lh={1}>
                              {t("common:approx.short")}{" "}
                              {t("common:currency", {
                                value: assetValue,
                                symbol,
                              })}
                            </Text>
                            {accruing !== null && (
                              <Tooltip
                                text={`${t("positions.accruingTooltip", {
                                  amount: t("common:currency", {
                                    value: accruing,
                                    symbol,
                                    maximumFractionDigits: 6,
                                  }),
                                })}${harvestBlocked ? ` ${harvestExplanation}` : ""}`}
                              >
                                <TooltipIcon size="1em" />
                              </Tooltip>
                            )}
                          </Flex>
                        }
                        bottomLabel={
                          accrualPaused
                            ? `${t("common:currency", { value: usdValue })} · ${t("positions.accrualPaused")}`
                            : accruing !== null && harvestBlocked
                              ? `${t("common:currency", { value: usdValue })} · ${t(`positions.harvest.${harvestState}.label`)}`
                              : apy !== null && apy > 0
                                ? `${t("common:currency", { value: usdValue })} · ${t("positions.earning")}`
                                : t("common:currency", { value: usdValue })
                        }
                      />
                      <ValueStats
                        wrap
                        size="small"
                        font="secondary"
                        label={t("positions.col.netApy")}
                        customValue={
                          <Text fs="p3" fw={500} lh={1}>
                            {accrualPaused || apy === null
                              ? "—"
                              : t("common:percent", { value: apy })}
                          </Text>
                        }
                        bottomLabel={
                          accrualPaused
                            ? t("positions.accrualPausedNote")
                            : t("positions.col.netApy.note")
                        }
                      />
                    </>
                  }
                  cta={
                    <Flex gap="s" wrap justify="flex-end">
                      <Button
                        aria-label={`${t("positions.action.withdraw")} ${symbol}`}
                        disabled={shares <= 0}
                        variant="tertiary"
                        size="small"
                        onClick={() => onWithdraw(vault)}
                      >
                        {t("positions.action.withdraw")}
                      </Button>
                    </Flex>
                  }
                />
              )
            },
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
