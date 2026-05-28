import {
  Box,
  Button,
  Flex,
  Paper,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

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

const HEALTH_LIQUIDATION_THRESHOLD = 1.0
const HEALTH_WARNING_THRESHOLD = 1.5

const formatHf = (hf: number) => {
  if (hf === Infinity) return "∞"
  if (hf > 999) return ">999"
  return hf.toFixed(2)
}

const hfColorToken = (hf: number) => {
  if (hf <= HEALTH_LIQUIDATION_THRESHOLD)
    return getToken("accents.danger.emphasis")
  if (hf <= HEALTH_WARNING_THRESHOLD) return getToken("accents.alert.primary")
  return getToken("accents.success.emphasis")
}

export const MyBorrowsCard = ({
  poolPosition,
  borrowApyPercent,
  vaultApyPercent,
  onBorrow,
  onRepay,
}: Props) => {
  const { t } = useTranslation(["hdcl", "common"])

  const totalCollateralUsd = poolPosition?.totalCollateralUsd ?? 0
  const totalDebtUsd = poolPosition?.totalDebtUsd ?? 0
  const availableUsd = poolPosition?.availableBorrowsUsd ?? 0
  const ltvPct = poolPosition?.ltvPct ?? 0
  const healthFactor = poolPosition?.healthFactor ?? Infinity
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
      <Flex align="center" justify="space-between" p="l" wrap>
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("borrows.title")}
        </Text>
        <Flex align="center" gap="l" ml="auto">
          <Flex align="center" gap="xs">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("borrows.healthFactor")}:
            </Text>
            <Text fs="p4" fw={600} color={hfColorToken(healthFactor)}>
              {formatHf(healthFactor)}
            </Text>
          </Flex>
          <Flex align="center" gap="xs">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("borrows.borrowApy")}:
            </Text>
            <Text fs="p4" fw={600} color={getToken("text.high")}>
              {t("common:percent", {
                value: borrowApyPercent,
              })}
            </Text>
          </Flex>
          {hasCollateral && (
            <Flex align="center" gap="xs">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("borrows.netApy")}:
              </Text>
              <Text
                fs="p4"
                fw={600}
                color={getToken("accents.success.emphasis")}
              >
                {t("common:percent", {
                  prefix: netApyPercent >= 0 ? "+" : "",
                  value: netApyPercent,
                  maximumFractionDigits: 1,
                })}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>

      <Separator />

      <Flex gap={["s", null, "xl"]} direction={["column", null, "row"]}>
        <Flex justify="space-between" px="l" py="xl" flex={1}>
          <ValueStats
            wrap
            size="medium"
            label={t("borrows.debt")}
            value={t("common:currency", {
              value: totalDebtUsd,
              symbol: t("borrows.unit"),
            })}
            bottomLabel={t("borrows.borrowingPowerUsed", {
              value: borrowingPowerUsedPct,
            })}
          />
          <Box mt="m">
            <Button variant="secondary" onClick={onRepay} disabled={!hasDebt}>
              {t("borrows.repay")}
            </Button>
          </Box>
        </Flex>

        <Separator orientation={["horizontal", null, "vertical"]} />

        <Flex justify="space-between" px="l" py="xl" flex={1}>
          <ValueStats
            wrap
            size="medium"
            label={t("borrows.available")}
            value={t("common:currency", {
              value: availableUsd,
              symbol: t("borrows.unit"),
            })}
          />
          <Box mt="m">
            <Button
              variant="primary"
              onClick={onBorrow}
              disabled={!hasCollateral || availableUsd <= 0}
            >
              {t("borrows.borrow")}
            </Button>
          </Box>
        </Flex>
      </Flex>
    </Paper>
  )
}
