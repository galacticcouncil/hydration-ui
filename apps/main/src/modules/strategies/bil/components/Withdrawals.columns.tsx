import { Amount, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { BIL_ERC20_ID, HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { hoursToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssets } from "@/providers/assetsProvider"

export type WithdrawalRowState =
  | "pending"
  | "partial"
  | "fulfilled"
  | "cancelled"

export interface WithdrawalRow {
  id: number
  amountBil: number
  estHollar: number
  requestedDate: Date
  state: WithdrawalRowState
  timeRemainingDays?: number
  fulfilledDate?: Date
  /** Shares already queue-side-settled and ready for the user to claim. */
  claimableBil?: number
  /** HOLLAR price-locked at settlement, paid out when the user claims. */
  claimableHollar?: number
}

const columnHelper = createColumnHelper<WithdrawalRow>()

const isActive = (s: WithdrawalRowState) => s === "pending" || s === "partial"

export type WithdrawalColumnHandlers = {
  /** Cancel an active queued redemption (auto-resupplies as aBIL). */
  onCancel: (id: number) => void
  isCancelling: boolean
  /** Claim settled HOLLAR for a single request (calls vault.redeem). */
  onClaim: (claimableBil: number) => void
  isClaiming: boolean
  /**
   * Instant-exit a still-queued redemption: cancel + resupply as aBIL, then
   * swap the freed aBIL for HOLLAR. Sequenced two-signature flow.
   */
  onInstantRedeem: (id: number, amountBil: number) => void
  isInstantRedeeming: boolean
}

export const useWithdrawalColumns = ({
  onCancel,
  isCancelling,
  onClaim,
  isClaiming,
  onInstantRedeem,
  isInstantRedeeming,
}: WithdrawalColumnHandlers) => {
  const { t } = useTranslation(["strategies", "common"])
  const { isMobile } = useBreakpoints()

  const { getAssetWithFallback } = useAssets()

  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  return useMemo(() => {
    const amountColumn = columnHelper.accessor("amountBil", {
      header: t("common:amount"),
      cell: ({ row }) => (
        <Flex align="center" gap="s">
          <AssetLogo id={BIL_ERC20_ID} size="small" />
          <Text fs="p4" fw={500} color={getToken("text.high")}>
            {t("common:currency", {
              value: row.original.amountBil,
              symbol: "BIL",
            })}
          </Text>
        </Flex>
      ),
    })

    const estValueColumn = columnHelper.accessor("estHollar", {
      header: t("bil.withdrawals.col.estValue"),
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
      header: t("bil.withdrawals.col.timeRemaining"),
      cell: ({ row }) => {
        const r = row.original
        // Settled shares that the user hasn't claimed yet — always take
        // priority over the time-remaining countdown.
        if ((r.claimableBil ?? 0) > 0) {
          return (
            <Text fs="p4" fw={600} color={getToken("accents.success.primary")}>
              {t("bil.withdrawals.state.claimable")}
            </Text>
          )
        }
        if (r.state === "fulfilled" || r.state === "cancelled") {
          return (
            <Text fs="p4" color={getToken("text.medium")}>
              {r.state === "fulfilled"
                ? t("bil.withdrawals.state.redeemed")
                : t("bil.withdrawals.state.cancelled")}
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
        const claimable = r.claimableBil ?? 0
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
                    onInstantRedeem(r.id, r.amountBil)
                  }}
                  disabled={isInstantRedeeming || isCancelling}
                >
                  {t("bil.withdrawals.action.instant")}
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
