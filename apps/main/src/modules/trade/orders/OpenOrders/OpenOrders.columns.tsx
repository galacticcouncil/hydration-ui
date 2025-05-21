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
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AmountMobile } from "@/modules/trade/orders/columns/AmountMobile"
import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapMobile } from "@/modules/trade/orders/columns/SwapMobile"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import { DcaOrderDetailsMobileModal } from "@/modules/trade/orders/DcaOrderDetailsMobileModal"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"

const columnHelper = createColumnHelper<OrderData>()

export const useOpenOrdersColumns = () => {
  const { t } = useTranslation(["common", "trade"])
  const { isDesktop } = useBreakpoints()

  return useMemo(() => {
    const fromToColumn = columnHelper.display({
      header: t("trade:trade.orders.openOrders.inOut"),
      cell: ({ row }) => {
        return (
          <SwapAmount
            fromAmount={row.original.fromAmountExecuted}
            from={row.original.from}
            toAmount={row.original.toAmountExecuted}
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
        <Flex gap={4} align="center" justify="center">
          {t("trade:trade.orders.openOrders.averagePrice")}
          <Icon
            size={12}
            component={ArrowRightLeft}
            color={getToken("textButtons.small.hover")}
          />
        </Flex>
      ),
      cell: ({ row }) => {
        return (
          <SwapPrice
            from={row.original.from}
            to={row.original.to}
            price={row.original.price}
          />
        )
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
      id: "ations",
      cell: function Cell({ row }) {
        const [confirmationModal, setConfirmationModal] = useState(false)

        return (
          <>
            <Button
              variant="danger"
              outline
              onClick={(e) => {
                e.stopPropagation()
                setConfirmationModal(true)
              }}
            >
              <Icon component={Trash} size={14} />
            </Button>
            <Modal open={confirmationModal} onOpenChange={setConfirmationModal}>
              <TerminateDcaScheduleModalContent
                scheduleId={row.original.scheduleId}
                sold={row.original.fromAmountExecuted}
                total={row.original.fromAmountBudget}
                symbol={row.original.to.symbol}
                onClose={() => setConfirmationModal(false)}
              />
            </Modal>
          </>
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
      cell: function Cell({ row }) {
        const [modal, setModal] = useState(false)

        return (
          <>
            <TableRowDetailsExpand onClick={() => setModal(true)}>
              <AmountMobile
                fromAmount={row.original.fromAmountExecuted}
                from={row.original.from}
                status={row.original.status}
              />
            </TableRowDetailsExpand>
            <Modal open={modal} onOpenChange={setModal}>
              <DcaOrderDetailsMobileModal details={row.original} />
            </Modal>
          </>
        )
      },
    })

    return !isDesktop
      ? [fromToColumnMobile, statusColumnMobile]
      : [
          fromToColumn,
          averagePriceColumn,
          typeColumn,
          statusColumn,
          actionColumn,
        ]
  }, [t, isDesktop])
}
