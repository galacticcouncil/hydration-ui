import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
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
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import { SwapData } from "@/modules/trade/orders/lib/useSwapsData"
import { SwapDetailsMobileModal } from "@/modules/trade/orders/SwapDetailsMobileModal"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"

const columnHelper = createColumnHelper<SwapData>()

export const useMyRecentActivityColumns = () => {
  const { t } = useTranslation(["common", "trade"])
  const { isDesktop } = useBreakpoints()

  return useMemo(() => {
    const fromToColumn = columnHelper.display({
      header: t("trade:trade.orders.myActivity.fromTo"),
      cell: ({ row }) => {
        return (
          <SwapAmount
            fromAmount={row.original.fromAmount}
            from={row.original.from}
            toAmount={row.original.toAmount}
            to={row.original.to}
          />
        )
      },
    })

    const fillPriceColumn = columnHelper.display({
      id: "price",
      meta: {
        sx: { textAlign: "center" },
      },
      header: () => (
        <Flex gap={4} align="center" justify="center">
          {t("trade:trade.orders.myActivity.fillPrice")}
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
            price={row.original.fillPrice}
          />
        )
      },
    })

    const typeColumn = columnHelper.display({
      header: t("trade:trade.orders.myActivity.type"),
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => {
        return (
          row.original.status && <SwapType type={row.original.status.kind} />
        )
      },
    })

    const statusColumn = columnHelper.display({
      header: t("trade:trade.orders.myActivity.status"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => {
        const { status } = row.original

        if (!status) {
          return null
        }

        return status.kind === "dca" ? (
          status.status && <DcaOrderStatus status={status.status} />
        ) : (
          <SwapStatus />
        )
      },
    })

    const actionColumn = columnHelper.display({
      id: "actions",
      cell: function Cell({ row }) {
        const { status } = row.original
        const [modal, setModal] = useState<
          "none" | "dcaTermination" | "details"
        >("none")

        return (
          <Flex gap={8} align="center" justify="flex-end">
            {status?.kind === "dca" &&
              status.status === DcaScheduleStatus.Created && (
                <>
                  <Button
                    variant="danger"
                    outline
                    onClick={(e) => {
                      e.preventDefault()
                      setModal("dcaTermination")
                    }}
                  >
                    <Icon component={Trash} size={14} />
                  </Button>
                  <Modal
                    open={modal === "dcaTermination"}
                    onOpenChange={() => setModal("none")}
                  >
                    <TerminateDcaScheduleModalContent
                      scheduleId={status.scheduleId}
                      sold={status.sold}
                      total={status.total}
                      symbol={status.symbol}
                      onClose={() => setModal("none")}
                    />
                  </Modal>
                </>
              )}
            <TableRowDetailsExpand onClick={() => setModal("details")} />
            <Modal
              open={modal === "details"}
              onOpenChange={() => setModal("none")}
            >
              <SwapDetailsMobileModal details={row.original} />
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
      cell: function Cell({ row }) {
        const [modal, setModal] = useState(false)

        return (
          <>
            <TableRowDetailsExpand onClick={() => setModal(true)}>
              <AmountMobile
                fromAmount={row.original.fromAmount}
                from={row.original.from}
                status={row.original.status?.status}
              />
            </TableRowDetailsExpand>
            <Modal open={modal} onOpenChange={setModal}>
              <SwapDetailsMobileModal details={row.original} />
            </Modal>
          </>
        )
      },
    })

    return !isDesktop
      ? [fromToColumnMobile, statusColumnMobile]
      : [fromToColumn, fillPriceColumn, typeColumn, statusColumn, actionColumn]
  }, [t, isDesktop])
}
