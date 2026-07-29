import { Amount, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { hoursToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"

export interface WithdrawalRow {
  id: number
  amountBil: number
  estHollar: number
  timeRemainingDays?: number
  /** Shares already queue-side-settled and ready for the user to claim. */
  claimableBil?: number
  /** HOLLAR price-locked at settlement, paid out when the user claims. */
  claimableHollar?: number
}

const columnHelper = createColumnHelper<WithdrawalRow>()

export type WithdrawalColumnHandlers = {
  onCancel: (id: number) => void
  isCancelling: boolean
  onClaim: (claimableBil: number) => void
  isClaiming: boolean
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

  const { bil, hollar } = useBilStrategy()

  return useMemo(() => {
    const amountColumn = columnHelper.accessor("amountBil", {
      header: t("common:amount"),
      cell: ({ row }) => (
        <Flex align="center" gap="s">
          <AssetLogo id={bil.id} size="small" />
          <Text fs="p4" fw={500} color={getToken("text.high")}>
            {t("common:currency", {
              value: row.original.amountBil,
              symbol: bil.symbol,
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

    const timeRemainingColumn = columnHelper.display({
      id: "timeRemaining",
      header: t("bil.withdrawals.col.timeRemaining"),
      cell: ({ row }) => {
        const r = row.original
        if ((r.claimableBil ?? 0) > 0) {
          return (
            <Text fs="p4" fw={600} color={getToken("accents.success.primary")}>
              {t("bil.withdrawals.state.claimable")}
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
          </Flex>
        )
      },
    })

    return [amountColumn, estValueColumn, timeRemainingColumn, actionsColumn]
  }, [
    t,
    isMobile,
    bil.id,
    bil.symbol,
    hollar.symbol,
    isCancelling,
    onCancel,
    isClaiming,
    onClaim,
    onInstantRedeem,
    isInstantRedeeming,
  ])
}
