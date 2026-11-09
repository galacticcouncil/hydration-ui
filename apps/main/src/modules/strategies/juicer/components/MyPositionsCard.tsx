import {
  AssetLabel,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Chip,
  Flex,
  PositionCard,
  Stack,
  Text,
  TextButton,
  Tooltip,
  TooltipIcon,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { AssetLogo } from "@/components/AssetLogo"
import { DepositProgress } from "@/modules/strategies/juicer/components/DepositProgress"
import { JuicerStrategyLogo } from "@/modules/strategies/juicer/components/JuicerStrategyLogo"
import { SStats } from "@/modules/strategies/juicer/components/MyPositionsCard.styled"
import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import { useVaultDisplayAsset } from "@/modules/strategies/juicer/hooks/useCollateralEquivalent"
import {
  type IceDeposit,
  useIceDepositStore,
} from "@/modules/strategies/juicer/hooks/useIceDeposit"
import { type JuicerPosition } from "@/modules/strategies/juicer/hooks/useJuicerAccount"
import {
  type IceDepositStage,
  readIceDepositProgress,
} from "@/modules/strategies/juicer/utils/iceDeposit"
import { useAssets } from "@/providers/assetsProvider"

interface MyPositionsCardProps {
  positions: JuicerPosition[]
  /** ICE deposits in flight: each shows as a progress bar on its position */
  iceDeposits: IceDeposit[]
  onWithdraw: (vault: JuicerVaultConfig) => void
}

export const MyPositionsCard: FC<MyPositionsCardProps> = ({
  positions,
  iceDeposits,
  onWithdraw,
}) => {
  const { t } = useTranslation(["juicer", "common"])
  const getDisplayAsset = useVaultDisplayAsset()
  const { getAssetWithFallback } = useAssets()

  const depositInto = (vault: JuicerVaultConfig) =>
    iceDeposits.find((d) => d.vault.vaultAddress === vault.vaultAddress)
  // a first deposit has no position yet: show it until the position does
  const firstDeposits = iceDeposits.filter(
    (d, i) =>
      !positions.some((p) => p.vault.vaultAddress === d.vault.vaultAddress) &&
      iceDeposits.findIndex(
        (o) => o.vault.vaultAddress === d.vault.vaultAddress,
      ) === i,
  )

  if (!positions.length && !firstDeposits.length) return null

  const logoAndSymbol = (vault: JuicerVaultConfig) => {
    const displayAsset = getDisplayAsset(vault)
    return {
      logo: <AssetLogo id={displayAsset.id} size="medium" hideChain />,
      symbol: (
        <AssetLabel
          symbol={displayAsset.symbol}
          badge={
            <Chip variant="amber" size="extra-small" rounded>
              <JuicerStrategyLogo size="extra-small" />
              Juicer
            </Chip>
          }
        />
      ),
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("positions.title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <Stack gap="m">
          {firstDeposits.map((deposit) => {
            const pay = getAssetWithFallback(deposit.assetIn)
            return (
              <PositionCard
                key={deposit.key}
                // one column: the stats spread evenly between the value and the actions
                columns={1}
                {...logoAndSymbol(deposit.vault)}
                stats={
                  <SStats>
                    <ValueStats
                      wrap
                      size="small"
                      font="secondary"
                      label={t("positions.col.amount")}
                      customValue={
                        <Text fs="p3" fw={500} lh={1}>
                          {t("common:currency", {
                            value: formatUnits(deposit.amountIn, pay.decimals),
                            symbol: pay.symbol,
                          })}
                        </Text>
                      }
                    />
                  </SStats>
                }
                cta={<IceDepositStatus deposit={deposit} />}
              />
            )
          })}
          {positions.map(
            ({
              vault,
              shares,
              assetValue,
              usdValue,
              apy,
              deployedFraction,
              accrualPaused,
              pendingYield,
              harvestStatus,
            }) => {
              // amounts arrive from useJuicerAccount already converted to
              // the current display asset; share units never surface here
              const displayAsset = getDisplayAsset(vault)
              const { symbol } = displayAsset
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
              const value = t("common:currency", { value: usdValue })
              const deposit = depositInto(vault)

              return (
                <PositionCard
                  key={vault.vaultAddress}
                  // one column: the stats spread evenly between the value and the actions
                  columns={1}
                  {...logoAndSymbol(vault)}
                  stats={
                    <SStats>
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
                            ? t("positions.statusLine", {
                                value,
                                status: t("positions.accrualPaused"),
                              })
                            : accruing !== null && harvestBlocked
                              ? t("positions.statusLine", {
                                  value,
                                  status: t(
                                    `positions.harvest.${harvestState}.label`,
                                  ),
                                })
                              : apy !== null && apy > 0
                                ? t("positions.statusLine", {
                                    value,
                                    status: t("positions.earning"),
                                  })
                                : value
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
                        // the rate is pooled: borrowing below target LTV
                        // lowers everyone's rate, so say how far below
                        bottomLabel={
                          accrualPaused
                            ? t("positions.accrualPausedNote")
                            : deployedFraction !== null &&
                                deployedFraction < 0.995
                              ? t("positions.col.netApy.deployed", {
                                  value: deployedFraction * 100,
                                })
                              : t("positions.col.netApy.note")
                        }
                      />
                    </SStats>
                  }
                  cta={
                    deposit ? (
                      <IceDepositStatus deposit={deposit} />
                    ) : (
                      <Flex gap="s" wrap justify="flex-end">
                        <Button
                          aria-label={t("positions.action.withdrawAsset", {
                            symbol,
                          })}
                          disabled={shares <= 0}
                          variant="tertiary"
                          size="small"
                          onClick={() => onWithdraw(vault)}
                        >
                          {t("positions.action.withdraw")}
                        </Button>
                      </Flex>
                    )
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

type ProgressStage = "submitting" | "submitted" | "filled" | "deposited"

/** an ICE deposit's progress in place of the actions; a failure until closed */
const IceDepositStatus: FC<{ deposit: IceDeposit }> = ({ deposit }) => {
  const { t } = useTranslation(["juicer", "common"])
  const dismiss = useIceDepositStore((s) => s.dismiss)
  const progress = readIceDepositProgress(deposit.stage)

  if (progress !== null)
    return (
      <DepositProgress
        // a new deposit starts a new bar instead of counting down from 100%
        key={deposit.key}
        label={t(`ice.progress.${deposit.stage}`)}
        progress={progress}
      />
    )

  // no progress: the deposit failed or expired
  const stage = deposit.stage as Exclude<IceDepositStage, ProgressStage>
  return (
    <Flex gap="s" align="center" justify="flex-end">
      <Chip variant="red" size="small" rounded>
        {t(`ice.progress.${stage}`)}
      </Chip>
      <TextButton onClick={() => dismiss(deposit.key)}>
        {t("common:close")}
      </TextButton>
    </Flex>
  )
}
