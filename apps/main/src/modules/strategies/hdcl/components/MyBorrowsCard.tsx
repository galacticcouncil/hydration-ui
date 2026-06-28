import { HealthFactorNumber } from "@galacticcouncil/money-market/components"
import {
  Box,
  Button,
  Flex,
  Paper,
  ResponsiveScope,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  SBorrowPanel,
  SBorrowsContent,
  SBorrowsSeparator,
} from "@/modules/strategies/hdcl/components/MyBorrowsCard.styled"
import type { HdclPoolPosition } from "@/modules/strategies/hdcl/hooks/useHdclPoolPosition"

interface Props {
  poolPosition: HdclPoolPosition | undefined
  borrowApyPercent: number
  /**
   * Annualised vault APY on the collateral side, in percent. Used together
   * with `borrowApyPercent` to compute the user's leveraged net APY.
   */
  vaultApyPercent: number
  onBorrow: () => void
  onRepay: () => void
}

export const MyBorrowsCard = ({
  poolPosition,
  borrowApyPercent,
  vaultApyPercent,
  onBorrow,
  onRepay,
}: Props) => {
  const { t } = useTranslation(["strategies", "borrow", "common"])

  const totalCollateralUsd = poolPosition?.totalCollateralUsd ?? 0
  const totalDebtUsd = poolPosition?.totalDebtUsd ?? 0
  const availableUsd = poolPosition?.availableBorrowsUsd ?? 0
  const ltvPct = poolPosition?.ltvPct ?? 0
  const healthFactor = poolPosition?.healthFactor ?? Infinity
  const healthFactorValue =
    healthFactor === Infinity ? "-1" : healthFactor.toString()
  const hasCollateral = !!poolPosition?.hasCollateral
  const hasDebt = totalDebtUsd > 0

  const totalCreditUsd = totalCollateralUsd * (ltvPct / 100)
  const borrowingPowerUsedPct =
    totalCreditUsd > 0 ? (totalDebtUsd / totalCreditUsd) * 100 : 0

  // Effective leveraged net APY on the user's *equity*:
  //   leverage = collateral / equity,  equity = collateral − debt
  //   netApy   = L × vault_apy − (L − 1) × borrow_apy
  // For users with collateral but no debt, leverage = 1 and netApy = vault APY.
  // Hidden when there's no collateral (nothing meaningful to show).
  const equityUsd = totalCollateralUsd - totalDebtUsd
  const leverage = equityUsd > 0 ? totalCollateralUsd / equityUsd : 0
  const netApyPercent =
    leverage > 0
      ? leverage * vaultApyPercent - (leverage - 1) * borrowApyPercent
      : 0

  return (
    <Paper>
      <Flex align="center" justify="space-between" p="l" gap="s" wrap>
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("hdcl.borrows.title")}
        </Text>
        <Flex align="center" gap="l">
          <Flex align="center" gap="s">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("common:healthFactor")}:
            </Text>
            <HealthFactorNumber value={healthFactorValue} fontSize="p4" />
          </Flex>
          <Flex align="center" gap="s">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("common:borrowApy")}:
            </Text>
            <Text fs="p4" fw={600} color={getToken("text.high")}>
              {t("common:percent", {
                value: borrowApyPercent,
              })}
            </Text>
          </Flex>
          {hasCollateral && (
            <Flex align="center" gap="s">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("borrow:netApy")}:
              </Text>
              <Text
                fs="p4"
                fw={600}
                color={
                  netApyPercent >= 0
                    ? getToken("accents.success.emphasis")
                    : getToken("accents.danger.emphasis")
                }
              >
                {t("common:percent", {
                  value: netApyPercent,
                })}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>

      <Separator />

      <ResponsiveScope>
        <SBorrowsContent>
          <SBorrowPanel>
            <ValueStats
              wrap
              size="medium"
              label={t("borrow:debt")}
              value={t("common:currency", {
                value: totalDebtUsd,
                symbol: t("hdcl.borrows.unit"),
              })}
              bottomLabel={t("hdcl.borrows.borrowingPowerUsed", {
                value: borrowingPowerUsedPct,
              })}
            />
            <Box mt="m">
              <Button variant="secondary" onClick={onRepay} disabled={!hasDebt}>
                {t("borrow:repay")}
              </Button>
            </Box>
          </SBorrowPanel>

          <SBorrowsSeparator />

          <SBorrowPanel>
            <ValueStats
              wrap
              size="medium"
              label={t("borrow:borrow.available")}
              value={t("common:currency", {
                value: availableUsd,
                symbol: t("hdcl.borrows.unit"),
              })}
            />
            <Box mt="m">
              <Button
                variant="primary"
                onClick={onBorrow}
                disabled={!hasCollateral || availableUsd <= 0}
              >
                {t("borrow:borrow")}
              </Button>
            </Box>
          </SBorrowPanel>
        </SBorrowsContent>
      </ResponsiveScope>
    </Paper>
  )
}
