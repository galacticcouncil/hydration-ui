import {
  Amount,
  Button,
  Flex,
  MicroButton,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { DecentralLogo } from "@/modules/strategies/hdcl/components/DecentralLogo"

export type PositionRow = {
  /** Stable id for react-table key + filtering. */
  id: "supplied" | "raw"
  label: string
  amount: number
  usdValue: number
  /** Net worth (USD), after borrow. For the supplied row only — raw rows
      report the same as amount × rate (not collateralised, no borrow). */
  netWorthUsd: number
  /** Your net APY %, including borrow effects. */
  netApyPercent: number
  /** Whether to show the recovery Deposit button (raw HDCL only). */
  isRaw: boolean
}

const columnHelper = createColumnHelper<PositionRow>()

export type ColumnHandlers = {
  onWithdraw: (id: PositionRow["id"]) => void
  onDepositRaw: () => void
  isDepositingRaw: boolean
}

export const usePositionColumns = ({
  onWithdraw,
  onDepositRaw,
  isDepositingRaw,
}: ColumnHandlers) => {
  const { t } = useTranslation(["hdcl", "common"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const positionColumn = columnHelper.accessor("label", {
      header: isMobile ? "" : t("positions.col.position"),
      cell: ({ row }) => (
        <Flex align="center" gap="s">
          <DecentralLogo size={isMobile ? 28 : 24} />
          <Text fs="p4" fw={500} color={getToken("text.high")}>
            {row.original.label}
          </Text>
        </Flex>
      ),
    })

    const amountColumn = columnHelper.accessor("amount", {
      header: t("positions.col.amount"),
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => (
        <Amount
          value={t("common:currency", {
            value: row.original.amount,
            symbol: "aHDCL",
          })}
          displayValue={t("common:currency", {
            value: row.original.usdValue,
          })}
        />
      ),
    })

    const netWorthColumn = columnHelper.accessor("netWorthUsd", {
      header: t("positions.col.netWorth"),
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => (
        <Amount
          value={t("common:currency", {
            value: row.original.netWorthUsd,
          })}
          displayValue={t("positions.afterBorrow")}
        />
      ),
    })

    const netApyColumn = columnHelper.accessor("netApyPercent", {
      header: t("positions.col.netApy"),
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => (
        <Amount
          value={t("common:percent", {
            value: row.original.netApyPercent,
          })}
          displayValue={t("positions.inclBorrow")}
        />
      ),
    })

    const actionsColumn = columnHelper.display({
      id: "actions",
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => (
        <Flex justify="flex-end" align="center" gap="s">
          {row.original.isRaw && (
            <MicroButton
              onClick={(e) => {
                e.stopPropagation()
                onDepositRaw()
              }}
              disabled={isDepositingRaw}
            >
              {isDepositingRaw
                ? t("positions.action.depositing")
                : t("positions.action.deposit")}
            </MicroButton>
          )}
          <Button
            variant="tertiary"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onWithdraw(row.original.id)
            }}
          >
            {t("positions.action.withdraw")}
          </Button>
        </Flex>
      ),
    })

    return [
      positionColumn,
      amountColumn,
      netWorthColumn,
      netApyColumn,
      actionsColumn,
    ]
  }, [isMobile, t, onWithdraw, onDepositRaw, isDepositingRaw])
}
