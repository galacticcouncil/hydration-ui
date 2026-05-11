import {
  Amount,
  Button,
  Flex,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
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
}

const columnHelper = createColumnHelper<WithdrawalRow>()

const isActive = (s: WithdrawalRowState) => s === "pending" || s === "partial"

export type WithdrawalColumnHandlers = {
  /** Cancel an active queued redemption (auto-resupplies as aHDCL). */
  onCancel: (id: number) => void
  isCancelling: boolean
}

export const useWithdrawalColumns = ({
  onCancel,
  isCancelling,
}: WithdrawalColumnHandlers) => {
  const { t } = useTranslation(["hdcl", "common"])
  const { isMobile } = useBreakpoints()

  const { getAssetWithFallback } = useAssets()

  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  return useMemo(() => {
    const amountColumn = columnHelper.accessor("amountHdcl", {
      header: t("withdrawals.col.amount"),
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
      header: t("withdrawals.col.estValue"),
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
      header: t("withdrawals.col.date"),
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
      header: t("withdrawals.col.timeRemaining"),
      cell: ({ row }) => {
        const r = row.original
        if (r.state === "fulfilled" || r.state === "cancelled") {
          return (
            <Text fs="p4" color={getToken("text.medium")}>
              {r.state === "fulfilled"
                ? t("withdrawals.state.redeemed")
                : t("withdrawals.state.cancelled")}
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
        if (!isActive(r.state)) return null
        // Per-row Instant: blocked by SDK (handover lesson 11) — disabled
        // with tooltip pointing to the Cancel-then-modal-Instant flow.
        return (
          <Flex justify="flex-end" align="center" gap="base">
            <Tooltip text={t("withdrawals.instantDisabledTooltip")}>
              <Button variant="secondary" size="small" disabled>
                {t("withdrawals.action.instant")}
              </Button>
            </Tooltip>
            <Button
              variant="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onCancel(r.id)
              }}
              disabled={isCancelling}
            >
              {t("withdrawals.action.cancel")}
            </Button>
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
  }, [t, isMobile, hollar.symbol, isCancelling, onCancel])
}
