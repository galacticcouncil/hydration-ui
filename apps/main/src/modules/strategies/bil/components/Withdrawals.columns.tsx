import { Amount, Flex, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { hoursToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { WithdrawalRowActions } from "@/modules/strategies/bil/components/WithdrawalRowActions"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"

export interface WithdrawalRow {
  id: number
  amountBil: string
  estHollar: string
  timeRemainingDays?: number
  claimableBil?: string
  claimableHollar?: string
}

const columnHelper = createColumnHelper<WithdrawalRow>()

export const useWithdrawalColumns = () => {
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
        if (Big(r.claimableBil ?? "0").gt(0)) {
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
      cell: ({ row }) => <WithdrawalRowActions row={row.original} />,
    })

    return [amountColumn, estValueColumn, timeRemainingColumn, actionsColumn]
  }, [t, isMobile, bil.id, bil.symbol, hollar.symbol])
}
