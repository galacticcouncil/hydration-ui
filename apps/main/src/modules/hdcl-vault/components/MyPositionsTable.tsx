import { Box, Button, Flex, Paper, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { formatNumber } from "../utils/format"
import { DecentralLogo } from "./DecentralLogo"

interface Props {
  /** Supplied (collateralised) HDCL — the canonical "HDCL" balance. */
  hdclSupplied: number
  /**
   * Raw HDCL in the user's wallet — pre-batched-deposit legacy. Renders as
   * a separate row only when above the dust threshold; new deposits never
   * produce raw HDCL.
   */
  hdclRaw: number
  /** HDCL → HOLLAR exchange rate (HOLLAR is $-pegged so this also gives USD). */
  exchangeRate: number
  /** Strategy APY % (Phase 2: from vaultStats.apr). */
  apyPercent: number
  /**
   * Minimum balance considered "real" — anything below is treated as dust
   * and the corresponding row is hidden. Typically the vault's `minRedeem`
   * (anything below can't be redeemed anyway, so showing it is just noise).
   */
  minDisplayBalance: number
  /** Withdraw action for the supplied (aHDCL) row — opens the batched flow. */
  onWithdrawSupplied: () => void
  /** Withdraw action for the raw HDCL row — opens the single-call flow. */
  onWithdrawRaw: () => void
  /**
   * Deposit (= supply) action for the raw HDCL row — completes a partial
   * deposit by moving the raw HDCL into the pool as aHDCL collateral.
   */
  onDepositRaw: () => void
  /** Pending state for the supply mutation, gates the Deposit button. */
  isDepositingRaw?: boolean
  /** When true, hide the table body (collapsed via parent toggle). */
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const GRID = "1.5fr 1.5fr 1fr 120px"

/**
 * "My positions" table — Figma 6402:24464.
 *
 * Renders one row per HDCL form the user holds:
 *   - Always: aHDCL (collateralised in the HDCL Aave pool) — the canonical row
 *   - Conditional: raw HDCL — only when the user has a non-zero raw balance
 *     left over from a pre-refactor deposit (or a partial cancel)
 *
 * Each row has its own Withdraw button. The two flows are mechanically
 * different (raw skips the pool round-trip), so making them visually
 * distinct keeps the abstraction honest.
 */
export const MyPositionsTable = ({
  hdclSupplied,
  hdclRaw,
  exchangeRate,
  apyPercent,
  minDisplayBalance,
  onWithdrawSupplied,
  onWithdrawRaw,
  onDepositRaw,
  isDepositingRaw = false,
  collapsed = false,
  onToggleCollapse,
}: Props) => {
  const { t } = useTranslation("hdcl")
  // Hide rows for balances below the dust threshold — wei-scale residuals
  // from previous txs would otherwise render as a "0 HDCL / $0.00" row.
  const hasSupplied = hdclSupplied >= minDisplayBalance
  const hasRaw = hdclRaw >= minDisplayBalance
  const empty = !hasSupplied && !hasRaw
  const collateralLabel = t("strategy.collateralAsset")

  return (
    <Paper variant="plain" p={20}>
      <Flex justify="space-between" align="center">
        <Text font="primary" fs="h6" fw={500} color={getToken("text.high")}>
          {t("positions.title")}
        </Text>
        {onToggleCollapse && (
          <Button variant="muted" size="small" onClick={onToggleCollapse}>
            {collapsed ? `${t("positions.show")} ⌄` : `${t("positions.hide")} ⌃`}
          </Button>
        )}
      </Flex>

      {!collapsed && (
        <Box sx={{ mt: "m" }}>
          {/* Table header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: 12,
              padding: "8px 0",
              borderBottom: "1px solid",
              borderColor: "details.separators",
            }}
          >
            <Text fs="p5" fw={500} color={getToken("text.low")}>
              {t("positions.col.position")}
            </Text>
            <Text fs="p5" fw={500} color={getToken("text.low")}>
              {t("positions.col.amount")}
            </Text>
            <Text fs="p5" fw={500} color={getToken("text.low")}>
              {t("positions.col.apy")}
            </Text>
            <span />
          </Box>

          {empty && (
            <Flex justify="center" sx={{ py: "xl" }}>
              <Text fs="p4" color={getToken("text.low")}>
                {t("positions.empty")}
              </Text>
            </Flex>
          )}

          {hasSupplied && (
            <PositionRow
              label={collateralLabel}
              amount={hdclSupplied}
              usdValue={hdclSupplied * exchangeRate}
              apyPercent={apyPercent}
              actions={
                <Button variant="muted" size="small" onClick={onWithdrawSupplied}>
                  {t("positions.action.withdraw")}
                </Button>
              }
            />
          )}

          {hasRaw && (
            <PositionRow
              label={t("positions.uncollateralised", { label: collateralLabel })}
              amount={hdclRaw}
              usdValue={hdclRaw * exchangeRate}
              apyPercent={apyPercent}
              actions={
                // Two actions: Deposit moves the raw HDCL into the pool as
                // collateral (completes a partial deposit batch); Withdraw
                // queues it for HOLLAR redemption directly.
                <Flex direction="column" gap={4}>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={onDepositRaw}
                    disabled={isDepositingRaw}
                  >
                    {isDepositingRaw
                      ? t("positions.action.depositing")
                      : t("positions.action.deposit")}
                  </Button>
                  <Button variant="muted" size="small" onClick={onWithdrawRaw}>
                    {t("positions.action.withdraw")}
                  </Button>
                </Flex>
              }
            />
          )}
        </Box>
      )}
    </Paper>
  )
}

const PositionRow = ({
  label,
  amount,
  usdValue,
  apyPercent,
  actions,
}: {
  label: string
  amount: number
  usdValue: number
  apyPercent: number
  /** Action slot — single button or stack, depending on the row variant. */
  actions: React.ReactNode
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: GRID,
      gap: 12,
      padding: "12px 0",
      alignItems: "center",
      borderBottom: "1px solid",
      borderColor: "details.separators",
    }}
  >
    <Flex align="center" gap={8}>
      <DecentralLogo size={24} />
      <Text fs="p4" fw={500} color={getToken("text.high")}>
        {label}
      </Text>
    </Flex>
    <Flex direction="column" gap={2}>
      <Flex align="baseline" gap={4}>
        <Text fs="p4" fw={500} color={getToken("text.high")}>
          {formatNumber(amount, 0)}
        </Text>
        <Text fs="p6" color={getToken("text.low")}>
          HDCL
        </Text>
      </Flex>
      <Text fs="p6" color={getToken("text.low")}>
        ${formatNumber(usdValue, 2)}
      </Text>
    </Flex>
    <Text fs="p4" fw={500} color="accents.success.emphasis">
      {formatNumber(apyPercent, 2)}%
    </Text>
    {actions}
  </Box>
)
