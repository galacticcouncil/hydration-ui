import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { Trash } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapMobile } from "@/modules/trade/orders/columns/SwapMobile"
import { Status } from "@/modules/trade/orders/columns/SwapStatus"
import { TradeOrderHistoryItem } from "@/modules/trade/orders/lib/tradeOrdersHistory.types"
import { useTerminateDcaSchedule } from "@/modules/trade/orders/lib/useTerminateDcaSchedule"

const columnHelper = createColumnHelper<TradeOrderHistoryItem>()

const OrderStatus: React.FC<{
  order: TradeOrderHistoryItem
}> = ({ order }) => {
  const { t } = useTranslation("trade")

  if (!order.status) {
    return (
      <Status color={getToken("accents.success.emphasis")}>
        {t("trade.orders.status.active")}
      </Status>
    )
  }

  return (
    <DcaOrderStatus
      status={
        order.status.type === "Terminated"
          ? DcaScheduleStatus.Terminated
          : DcaScheduleStatus.Completed
      }
    />
  )
}

export const useTradeOrdersHistoryColumns = () => {
  const { t } = useTranslation(["common", "trade"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const pairColumn = columnHelper.display({
      header: t("trade:trade.orders.history.col.pair"),
      cell: ({ row }) => (
        <SwapMobile from={row.original.from} to={row.original.to} />
      ),
    })

    const intervalColumn = columnHelper.display({
      header: t("trade:trade.orders.history.col.interval"),
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => (
        <Text fw={500} fs="p6" lh={1.4} color={getToken("text.high")}>
          {row.original.intervalBlocks}
        </Text>
      ),
    })

    const amountColumn = columnHelper.display({
      header: t("trade:trade.orders.history.col.amount"),
      cell: ({ row }) => (
        <Flex gap="s" align="center">
          <Text fw={500} fs="p6" lh={1.4} color={getToken("text.high")}>
            {t("number", { value: row.original.amount })}
          </Text>
          <Text
            fw={500}
            fs="p6"
            lh={1.4}
            color={getToken("text.medium")}
            whiteSpace="nowrap"
          >
            {row.original.from.symbol}
          </Text>
        </Flex>
      ),
    })

    const statusColumn = columnHelper.display({
      header: t("trade:trade.orders.history.col.status"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => (
        <Flex justify="end">
          <OrderStatus order={row.original} />
        </Flex>
      ),
    })

    const actionColumn = columnHelper.display({
      id: "actions",
      meta: {
        sx: { textAlign: "end" },
      },
      cell: function Cell({ row }) {
        const terminateDcaSchedule = useTerminateDcaSchedule()

        if (row.original.status !== null) {
          return null
        }

        return (
          <Flex justify="end">
            <Button
              variant="danger"
              outline
              onClick={(e) => {
                e.stopPropagation()
                terminateDcaSchedule.mutate(row.original.id)
              }}
            >
              <Icon component={Trash} size="s" />
            </Button>
          </Flex>
        )
      },
    })

    const pairColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.history.col.pair"),
      cell: ({ row }) => (
        <SwapMobile from={row.original.from} to={row.original.to} />
      ),
    })

    const statusColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.history.col.status"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => (
        <Flex direction="column" gap="xs" align="end">
          <Text fw={600} fs="p5" lh={1} color={getToken("text.high")}>
            {t("currency", {
              value: row.original.amount,
              symbol: row.original.from.symbol,
            })}
          </Text>
          <OrderStatus order={row.original} />
        </Flex>
      ),
    })

    if (isMobile) {
      return [pairColumnMobile, statusColumnMobile]
    }

    return [
      pairColumn,
      intervalColumn,
      amountColumn,
      statusColumn,
      actionColumn,
    ]
  }, [t, isMobile])
}
