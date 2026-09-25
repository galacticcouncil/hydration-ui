import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PositionCard,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

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
          {positions.map(({ vault, shares, assetValue, usdValue, apy }) => {
            const { symbol } = getAssetWithFallback(vault.assetId)

            return (
              <PositionCard
                key={vault.vaultAddress}
                logo={<AssetLogo id={vault.assetId} size="medium" hideChain />}
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
                          {t("common:currency", {
                            value: shares,
                            symbol: vault.shareSymbol,
                          })}
                        </Text>
                      }
                      bottomLabel={t("common:currency", {
                        value: assetValue,
                        symbol,
                      })}
                    />
                    <ValueStats
                      wrap
                      size="small"
                      font="secondary"
                      label={t("positions.col.value")}
                      customValue={
                        <Text fs="p3" fw={500} lh={1}>
                          {t("common:currency", { value: usdValue })}
                        </Text>
                      }
                    />
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
                    />
                  </>
                }
                cta={
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => onWithdraw(vault)}
                  >
                    {t("positions.action.withdraw")}
                  </Button>
                }
              />
            )
          })}
        </Stack>
      </CardBody>
    </Card>
  )
}
