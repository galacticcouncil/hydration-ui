import { ArrowRightLeft, Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Modal,
  TableRowDetailsExpand,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AmountMobile } from "@/modules/trade/orders/columns/AmountMobile"
import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapMobile } from "@/modules/trade/orders/columns/SwapMobile"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"

const columnHelper = createColumnHelper<OrderData>()

export const useOpenOrdersColumns = () => {
  const { t } = useTranslation(["common", "trade"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const fromToColumn = columnHelper.display({
      header: t("trade:trade.orders.openOrders.inOut"),
      cell: ({ row }) => {
        return (
          <SwapAmount
            fromAmount={row.original.fromAmountBudget}
            from={row.original.from}
            to={row.original.to}
          />
        )
      },
    })

    const averagePriceColumn = columnHelper.display({
      id: "price",
      meta: {
        sx: { textAlign: "center" },
      },
      header: () => (
        <Flex gap="s" align="center" justify="center">
          {t("trade:trade.orders.openOrders.averagePrice")}
          <Icon
            size="xs"
            component={ArrowRightLeft}
            color={getToken("textButtons.small.hover")}
          />
        </Flex>
      ),
      cell: ({ row }) => {
        const { from, to, fromAmountExecuted, toAmountExecuted } = row.original

        const price =
          toAmountExecuted && fromAmountExecuted && Big(toAmountExecuted).gt(0)
            ? Big(fromAmountExecuted).div(toAmountExecuted).toString()
            : null

        return <SwapPrice from={from} to={to} price={price} />
      },
    })

    const typeColumn = columnHelper.display({
      header: t("trade:trade.orders.openOrders.type"),
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => {
        return <SwapType type={row.original.kind} />
      },
    })

    const statusColumn = columnHelper.display({
      header: t("trade:trade.orders.openOrders.status"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => {
        return (
          row.original.status && <DcaOrderStatus status={row.original.status} />
        )
      },
    })

    const actionColumn = columnHelper.display({
      id: "actions",
      cell: function Cell({ row }) {
        const [modal, setModal] = useState<"confirmation" | "none">("none")

        return (
          <Flex align="center" gap="base">
            <Button
              variant="danger"
              outline
              height={28}
              width={34}
              onClick={(e) => {
                e.stopPropagation()
                setModal("confirmation")
              }}
            >
              <Icon component={Trash} size="s" />
            </Button>
            <TableRowDetailsExpand />
            <Modal
              open={modal === "confirmation"}
              onOpenChange={() => setModal("none")}
            >
              <TerminateDcaScheduleModalContent
                scheduleId={row.original.scheduleId}
                sold={row.original.fromAmountExecuted}
                total={row.original.fromAmountBudget}
                symbol={row.original.from.symbol}
                onClose={() => setModal("none")}
              />
            </Modal>
          </Flex>
        )
      },
    })

    const fromToColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.fromTo.mobile"),
      cell: ({ row }) => {
        return <SwapMobile from={row.original.from} to={row.original.to} />
      },
    })

    const statusColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.status.mobile"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => (
        <TableRowDetailsExpand>
          <AmountMobile
            fromAmount={row.original.fromAmountExecuted}
            from={row.original.from}
            status={row.original.status}
          />
        </TableRowDetailsExpand>
      ),
    })

    if (isMobile) {
      return [fromToColumnMobile, statusColumnMobile]
    }

    return [
      fromToColumn,
      averagePriceColumn,
      typeColumn,
      statusColumn,
      actionColumn,
    ]
  }, [t, isMobile])
}
