import { Button, Flex, Paper, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { formatNumber } from "@/modules/hdcl-vault/utils/format"

interface Props {
  /** Amount of HOLLAR the user can still borrow against their HDCL collateral. */
  availableHollar: number
  /** USD value of `availableHollar`. */
  availableUsd: number
  /** Total credit line, in USD — the denominator for "$X of $Y". */
  totalCreditUsd: number
  onBorrow: () => void
  disabled?: boolean
}

/**
 * Right-rail "Available to borrow" card — Figma 6402:24464.
 * Shows how much HOLLAR the user can borrow against their HDCL collateral
 * in the HDCL Aave pool, plus a primary CTA that opens the Borrow modal.
 *
 * The actual data source (Aave reserve config + user reserve data for the
 * HDCL pool, ProviderId 22222255) gets wired in once Phase 4 plumbs a
 * second MoneyMarketProvider for HDCL.
 */
export const AvailableToBorrowCard = ({
  availableHollar,
  availableUsd,
  totalCreditUsd,
  onBorrow,
  disabled = false,
}: Props) => {
  const { t } = useTranslation("hdcl")
  return (
    <Paper variant="plain" p={20}>
      <Flex justify="space-between" align="center" gap={12}>
        <Flex direction="column" gap={4}>
          <Text fs="p5" fw={500} color={getToken("text.medium")}>
            {t("borrowCard.title")}
          </Text>
          <Flex align="baseline" gap={6}>
            <Text fs="h6" fw={500} color={getToken("text.high")}>
              {formatNumber(availableHollar, 0)}
            </Text>
            <Text fs="p4" fw={500} color={getToken("text.medium")}>
              {t("borrowCard.unit")}
            </Text>
          </Flex>
          <Text fs="p6" color={getToken("text.low")}>
            {t("borrowCard.range", {
              available: formatNumber(availableUsd, 0),
              total: formatNumber(totalCreditUsd, 0),
            })}
          </Text>
        </Flex>
        <Button
          size="medium"
          onClick={onBorrow}
          disabled={disabled || availableHollar <= 0}
        >
          {t("borrowCard.cta")}
        </Button>
      </Flex>
    </Paper>
  )
}
