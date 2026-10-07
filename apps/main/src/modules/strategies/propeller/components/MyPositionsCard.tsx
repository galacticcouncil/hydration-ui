import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  LoadingButton,
  PositionCard,
  Stack,
  Text,
  Tooltip,
  TooltipIcon,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { type PropellerPosition } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { useClaimYield } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"

interface Props {
  positions: PropellerPosition[]
  onWithdraw: (vault: PropellerVaultConfig) => void
}

export const MyPositionsCard = ({ positions, onWithdraw }: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const { getAssetWithFallback } = useAssets()
  const claimYield = useClaimYield()

  if (!positions.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("positions.title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <Stack gap="m">
          {positions.map(
            ({ vault, shares, assetValue, usdValue, apy, rewards }) => {
              const { symbol } = getAssetWithFallback(vault.assetId)

              return (
                <PositionCard
                  key={vault.vaultAddress}
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
                          <Text fs="p3" fw={500} lh={1}>
                            {t("common:approx.short")}{" "}
                            {t("common:currency", {
                              value: assetValue,
                              symbol,
                            })}
                          </Text>
                        }
                        bottomLabel={t("common:currency", { value: usdValue })}
                      />
                      {rewards &&
                        (rewards.estimatedAssets > 0 ||
                          rewards.claimableShares > 0n) && (
                          <ValueStats
                            wrap
                            size="small"
                            font="secondary"
                            label={t("positions.col.earnings")}
                            customValue={
                              <Flex gap="xs" align="center">
                                <Text fs="p3" fw={500} lh={1}>
                                  {t("common:currency", {
                                    value: rewards.claimableAssets,
                                    symbol,
                                  })}
                                </Text>
                                <Tooltip
                                  text={t("positions.earningsPending", {
                                    amount: Math.max(
                                      0,
                                      rewards.estimatedAssets -
                                        rewards.claimableAssets,
                                    ),
                                    symbol,
                                  })}
                                >
                                  <TooltipIcon size="1em" />
                                </Tooltip>
                              </Flex>
                            }
                            bottomLabel={t("positions.col.earnings.note")}
                          />
                        )}
                      <ValueStats
                        wrap
                        size="small"
                        font="secondary"
                        label={t("positions.col.netApy")}
                        customValue={
                          <Text fs="p3" fw={500} lh={1}>
                            {apy === null
                              ? "—"
                              : t("common:percent", { value: apy })}
                          </Text>
                        }
                        bottomLabel={t("positions.col.netApy.note")}
                      />
                    </>
                  }
                  cta={
                    <Flex gap="s" wrap justify="flex-end">
                      {rewards && rewards.claimableShares > 0n && (
                        <LoadingButton
                          aria-label={`${t("positions.action.claimEarnings")} ${symbol}`}
                          variant="tertiary"
                          size="small"
                          isLoading={
                            claimYield.isPending &&
                            claimYield.variables?.vaultAddress ===
                              vault.vaultAddress
                          }
                          disabled={claimYield.isPending}
                          onClick={() => claimYield.mutate(vault)}
                        >
                          {t("common:claim")}
                        </LoadingButton>
                      )}
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
