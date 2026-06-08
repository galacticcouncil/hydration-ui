import { Amount, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { PropellerLogo } from "@/modules/strategies/propeller/components/PropellerLogo"

export type WithdrawalRowState = "pending" | "settled" | "claimed"

export interface WithdrawalRow {
  id: number
  /** pETH shares the request escrowed. */
  amountShares: number
  /** ETH owed / claimable for the request. */
  estEth: number
  requestedDate: Date
  state: WithdrawalRowState
  settledDate?: Date
  claimedDate?: Date
  /** ETH already settled and ready for the user to claim. */
  claimableEth?: number
}

const columnHelper = createColumnHelper<WithdrawalRow>()

export type WithdrawalColumnHandlers = {
  /** Claim a settled request — calls vault.claim(requestId, receiver). */
  onClaim: (requestId: number) => void
  isClaiming: boolean
}

export const useWithdrawalColumns = ({
  onClaim,
  isClaiming,
}: WithdrawalColumnHandlers) => {
  const { t } = useTranslation(["propeller", "common"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const amountColumn = columnHelper.accessor("amountShares", {
      header: t("withdrawals.col.amount"),
      cell: ({ row }) => (
        <Flex align="center" gap="s">
          <PropellerLogo size={20} />
          <Text fs="p4" fw={500} color={getToken("text.high")}>
            {t("common:currency", {
              value: row.original.amountShares,
              symbol: "pETH",
            })}
          </Text>
        </Flex>
      ),
    })

    const estValueColumn = columnHelper.accessor("estEth", {
      header: t("withdrawals.col.estValue"),
      meta: { sx: { textAlign: isMobile ? "right" : "left" } },
      cell: ({ row }) => (
        <Amount
          value={t("common:currency", {
            value: row.original.estEth,
            symbol: "ETH",
          })}
          displayValue={t("common:currency", {
            value: row.original.estEth,
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

    const stateColumn = columnHelper.display({
      id: "state",
      header: t("withdrawals.col.status"),
      cell: ({ row }) => {
        const r = row.original
        if ((r.claimableEth ?? 0) > 0 && r.state !== "claimed") {
          return (
            <Text fs="p4" fw={600} color={getToken("accents.success.primary")}>
              {t("withdrawals.state.claimable")}
            </Text>
          )
        }
        if (r.state === "claimed") {
          return (
            <Text fs="p4" color={getToken("text.medium")}>
              {t("withdrawals.state.claimed")}
            </Text>
          )
        }
        return (
          <Text fs="p4" fw={600} color={getToken("accents.alert.primary")}>
            {t("withdrawals.state.pending")}
          </Text>
        )
      },
    })

    const actionsColumn = columnHelper.display({
      id: "actions",
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => {
        const r = row.original
        const claimable = r.claimableEth ?? 0
        if (claimable <= 0 || r.state === "claimed") return null
        return (
          <Flex justify="flex-end" align="center" gap="base">
            <Button
              variant="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onClaim(r.id)
              }}
              disabled={isClaiming}
            >
              {t("withdrawals.action.claim")}
            </Button>
          </Flex>
        )
      },
    })

    return [
      amountColumn,
      estValueColumn,
      dateColumn,
      stateColumn,
      actionsColumn,
    ]
  }, [t, isMobile, isClaiming, onClaim])
}
