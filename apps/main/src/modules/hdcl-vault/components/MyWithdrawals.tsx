import {
  Box,
  Button,
  Flex,
  Paper,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { formatDate, formatNumber } from "@/modules/hdcl-vault/utils/format"

import { HdclLogo } from "./HdclLogo"

export type WithdrawalRowState =
  | "pending"
  | "partial"
  | "fulfilled"
  | "cancelled"

export interface WithdrawalRow {
  id: number
  /** HDCL amount the user originally requested (or remaining for partials). */
  amountHdcl: number
  /** Estimated HOLLAR receivable for this row, given current exchange rate. */
  estHollar: number
  /** When the row was created (RedemptionRequested log block timestamp). */
  requestedDate: Date
  state: WithdrawalRowState
  /** For pending/partial: days until next scheduled fulfillment. */
  timeRemainingDays?: number
  /** For fulfilled: actual receipt timestamp. */
  fulfilledDate?: Date
}

interface Props {
  rows: WithdrawalRow[]
  /** Toggle persisted at parent so it survives re-renders. */
  showRedeemed: boolean
  onShowRedeemedChange: (next: boolean) => void
  /** Cancel an active request (state === pending|partial). */
  onCancelRedeem: (requestId: number) => void
  isCancelling: boolean
  /** Card collapse toggle. */
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const GRID = "1fr 1.5fr 1fr 1.5fr 80px"

const isActive = (s: WithdrawalRowState) => s === "pending" || s === "partial"

/**
 * "My withdrawals" card — Figma 6402:24464.
 *
 * Unified active-and-historical view of the user's redemption requests.
 * The "Show Redeemed" toggle controls whether fulfilled/cancelled rows are
 * visible; active rows always show.
 *
 * Time-remaining cell adapts to row state:
 *   - pending/partial → "{N} Days" countdown
 *   - fulfilled       → "Redeemed" pill
 *   - cancelled       → "Cancelled" pill
 *
 * The per-row Cancel action returns un-fulfilled HDCL to the user (and
 * auto-resupplies it as aHDCL — see `useCancelRedeem`). There is no per-row
 * instant-redeem path; users wanting an instant exit on a queued request
 * cancel first, then use the WithdrawModal's instant path on the freed
 * aHDCL balance. See "SDK doesn't support second Aave instance" lesson in
 * the handover for why this is a two-step rather than one-click flow.
 *
 * Replaces the prior `History` component — completed redemptions live here.
 */
export const MyWithdrawals = ({
  rows,
  showRedeemed,
  onShowRedeemedChange,
  onCancelRedeem,
  isCancelling,
  collapsed = false,
  onToggleCollapse,
}: Props) => {
  const { t } = useTranslation("hdcl")
  const visibleRows = useMemo(() => {
    const filtered = showRedeemed ? rows : rows.filter((r) => isActive(r.state))
    // Sort: active first (oldest request first), then completed (newest first)
    return filtered.sort((a, b) => {
      const aActive = isActive(a.state)
      const bActive = isActive(b.state)
      if (aActive && !bActive) return -1
      if (!aActive && bActive) return 1
      if (aActive) return a.requestedDate.getTime() - b.requestedDate.getTime()
      return b.requestedDate.getTime() - a.requestedDate.getTime()
    })
  }, [rows, showRedeemed])

  return (
    <Paper variant="plain" p={20}>
      <Flex justify="space-between" align="center">
        <Text font="primary" fs="h6" fw={500} color={getToken("text.high")}>
          {t("withdrawals.title")}
        </Text>
        <Flex align="center" gap={12}>
          <Flex align="center" gap={8}>
            <Text fs="p5" color={getToken("text.medium")}>
              {t("withdrawals.showRedeemed")}
            </Text>
            <Toggle
              size="medium"
              checked={showRedeemed}
              onCheckedChange={onShowRedeemedChange}
              name="show-redeemed"
            />
          </Flex>
          {onToggleCollapse && (
            <Button variant="muted" size="small" onClick={onToggleCollapse}>
              {collapsed
                ? `${t("withdrawals.show")} ⌄`
                : `${t("withdrawals.hide")} ⌃`}
            </Button>
          )}
        </Flex>
      </Flex>

      {!collapsed && (
        <Box sx={{ mt: "m" }}>
          {/* Header */}
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
              {t("withdrawals.col.amount")}
            </Text>
            <Text fs="p5" fw={500} color={getToken("text.low")}>
              {t("withdrawals.col.estValue")}
            </Text>
            <Text fs="p5" fw={500} color={getToken("text.low")}>
              {t("withdrawals.col.date")}
            </Text>
            <Text fs="p5" fw={500} color={getToken("text.low")}>
              {t("withdrawals.col.timeRemaining")}
            </Text>
            <span />
          </Box>

          {visibleRows.length === 0 && (
            <Flex justify="center" sx={{ py: "xl" }}>
              <Text fs="p4" color={getToken("text.low")}>
                {showRedeemed
                  ? t("withdrawals.empty.all")
                  : t("withdrawals.empty.pending")}
              </Text>
            </Flex>
          )}

          {visibleRows.map((row) => (
            <Box
              key={row.id}
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
              {/* Amount — HDCL logo prefix per Figma */}
              <Flex align="center" gap={6}>
                <HdclLogo size={20} />
                <Flex align="baseline" gap={4}>
                  <Text fs="p4" fw={500} color={getToken("text.high")}>
                    {formatNumber(row.amountHdcl, 0)}
                  </Text>
                  <Text fs="p6" color={getToken("text.low")}>
                    HDCL
                  </Text>
                </Flex>
              </Flex>

              {/* Est. Value */}
              <Flex direction="column" gap={2}>
                <Flex align="baseline" gap={4}>
                  <Text fs="p4" fw={500} color={getToken("text.high")}>
                    {formatNumber(row.estHollar, 0)}
                  </Text>
                  <Text fs="p6" color={getToken("text.low")}>
                    HOLLAR
                  </Text>
                </Flex>
                <Text fs="p6" color={getToken("text.low")}>
                  ${formatNumber(row.estHollar, 2)}
                </Text>
              </Flex>

              {/* Date */}
              <Text fs="p4" color={getToken("text.medium")}>
                {row.requestedDate.getTime() === 0
                  ? "—"
                  : formatDate(row.requestedDate)}
              </Text>

              {/* Time remaining cell — state-driven */}
              <TimeRemainingCell row={row} />

              {/* Action */}
              {isActive(row.state) ? (
                <Button
                  variant="muted"
                  size="small"
                  onClick={() => onCancelRedeem(row.id)}
                  disabled={isCancelling}
                >
                  {t("withdrawals.action.cancel")}
                </Button>
              ) : (
                <span />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  )
}

const StatePill = ({
  label,
  tone,
}: {
  label: string
  tone: "neutral" | "success"
}) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      px: "m",
      py: "s",
      borderRadius: "xxl",
      bg:
        tone === "success"
          ? "accents.success.dim"
          : "controls.fill.rest.default",
    }}
  >
    <Text
      fs="p6"
      fw={600}
      color={tone === "success" ? "accents.success.emphasis" : "text.medium"}
      transform="uppercase"
    >
      {label}
    </Text>
  </Box>
)

const TimeRemainingCell = ({ row }: { row: WithdrawalRow }) => {
  const { t } = useTranslation("hdcl")
  if (row.state === "fulfilled") {
    return <StatePill label={t("withdrawals.state.redeemed")} tone="success" />
  }
  if (row.state === "cancelled") {
    return <StatePill label={t("withdrawals.state.cancelled")} tone="neutral" />
  }
  // pending or partial
  const days = row.timeRemainingDays ?? 0
  return (
    <Text fs="p4" fw={600} color="accents.alert.primary">
      {days <= 0
        ? t("withdrawals.state.ready")
        : t("withdrawals.state.nDays", { days })}
    </Text>
  )
}
