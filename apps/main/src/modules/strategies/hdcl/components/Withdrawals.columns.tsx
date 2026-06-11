import { Amount, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { hoursToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { HdclLogo } from "@/modules/strategies/hdcl/components/HdclLogo"
import { useAssets } from "@/providers/assetsProvider"

export type WithdrawalRowState =
  | "pending"
  | "partial"
  | "fulfilled"
  | "cancelled"

export interface WithdrawalRow {
  id: number
  amountHdcl: number
  estHollar: number
  requestedDate: Date
  state: WithdrawalRowState
  timeRemainingDays?: number
  fulfilledDate?: Date
  /** Shares already queue-side-settled and ready for the user to claim. */
  claimableHdcl?: number
  /** HOLLAR price-locked at settlement, paid out when the user claims. */
  claimableHollar?: number
}

const columnHelper = createColumnHelper<WithdrawalRow>()

const isActive = (s: WithdrawalRowState) => s === "pending" || s === "partial"

export type WithdrawalColumnHandlers = {
  /** Cancel an active queued redemption (auto-resupplies as aHDCL). */
  onCancel: (id: number) => void
  isCancelling: boolean
  /** Claim settled HOLLAR for a single request (calls vault.redeem). */
  onClaim: (claimableHdcl: number) => void
  isClaiming: boolean
  /**
   * Instant-exit a still-queued redemption: cancel + resupply as aHDCL, then
   * swap the freed aHDCL for HOLLAR. Sequenced two-signature flow.
   */
  onInstantRedeem: (id: number, amountHdcl: number) => void
  isInstantRedeeming: boolean
  /** Whether the aHDCL/HOLLAR instant-redeem path is available (Aave layer). */
  instantAvailable: boolean
}

export const useWithdrawalColumns = ({
  onCancel,
  isCancelling,
  onClaim,
  isClaiming,
  onInstantRedeem,
  isInstantRedeeming,
  //instantAvailable,
}: WithdrawalColumnHandlers) => {
  const { t } = useTranslation(["strategies", "common"])
  const { isMobile } = useBreakpoints()

  const { getAssetWithFallback } = useAssets()

  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  return useMemo(() => {
    const amountColumn = columnHelper.accessor("amountHdcl", {
      header: t("common:amount"),
      cell: ({ row }) => (
        <Flex align="center" gap="s">
          <HdclLogo size={20} />
          <Text fs="p4" fw={500} color={getToken("text.high")}>
            {t("common:currency", {
              value: row.original.amountHdcl,
              symbol: "HDCL",
            })}
          </Text>
        </Flex>
      ),
    })

    const estValueColumn = columnHelper.accessor("estHollar", {
      header: t("hdcl.withdrawals.col.estValue"),
      meta: { sx: { textAlign: isMobile ? "right" : "left" } },
      cell: ({ row }) => (
        <Amount
          value={t("common:currency", {
            value: row.original.estHollar,
            symbol: hollar.symbol,
          })}
          displayValue={t("common:currency", {
            value: row.original.estHollar,
          })}
        />
      ),
    })

    const dateColumn = columnHelper.accessor("requestedDate", {
      header: t("common:date"),
      cell: ({ row }) =>
        row.original.requestedDate.getTime() === 0 ? (
          <Text fs="p4" color={getToken("text.medium")}>
            —
          </Text>
        ) : (
          <Text fs="p4" color={getToken("text.medium")}>
            {t("common:date.datetime.short", {
              value: row.original.requestedDate,
            })}
          </Text>
        ),
    })

    const timeRemainingColumn = columnHelper.display({
      id: "timeRemaining",
      header: t("hdcl.withdrawals.col.timeRemaining"),
      cell: ({ row }) => {
        const r = row.original
        // Settled shares that the user hasn't claimed yet — always take
        // priority over the time-remaining countdown.
        if ((r.claimableHdcl ?? 0) > 0) {
          return (
            <Text fs="p4" fw={600} color={getToken("accents.success.primary")}>
              {t("hdcl.withdrawals.state.claimable")}
            </Text>
          )
        }
        if (r.state === "fulfilled" || r.state === "cancelled") {
          return (
            <Text fs="p4" color={getToken("text.medium")}>
              {r.state === "fulfilled"
                ? t("hdcl.withdrawals.state.redeemed")
                : t("hdcl.withdrawals.state.cancelled")}
            </Text>
          )
        }
        const days = r.timeRemainingDays ?? 0
        return (
          <Text fs="p4" fw={600} color={getToken("accents.alert.primary")}>
            {t("common:interval", {
              value: hoursToMilliseconds(days * 24),
              unit: "d",
            })}
          </Text>
        )
      },
    })

    const actionsColumn = columnHelper.display({
      id: "actions",
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => {
        const r = row.original
        const claimable = r.claimableHdcl ?? 0
        const stillActive = isActive(r.state)
        if (!stillActive && claimable <= 0) return null
        return (
          <Flex justify="flex-end" align="center" gap="base">
            {claimable > 0 && (
              <Button
                variant="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onClaim(claimable)
                }}
                disabled={isClaiming}
              >
                {t("common:claim")}
              </Button>
            )}
            {stillActive && (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onInstantRedeem(r.id, r.amountHdcl)
                  }}
                  // Two-step flow: keep the button disabled across BOTH the
                  // cancel+resupply (isCancelling) and the aHDCL->HOLLAR swap
                  // (isInstantRedeeming) so it can't be re-fired mid-sequence.
                  disabled={isInstantRedeeming || isCancelling}
                >
                  {t("hdcl.withdrawals.action.instant")}
                </Button>
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCancel(r.id)
                  }}
                  disabled={isCancelling}
                >
                  {t("common:cancel")}
                </Button>
              </>
            )}
          </Flex>
        )
      },
    })

    return [
      amountColumn,
      estValueColumn,
      dateColumn,
      timeRemainingColumn,
      actionsColumn,
    ]
  }, [
    t,
    isMobile,
    hollar.symbol,
    isCancelling,
    onCancel,
    isClaiming,
    onClaim,
    onInstantRedeem,
    isInstantRedeeming,
  ])
}
