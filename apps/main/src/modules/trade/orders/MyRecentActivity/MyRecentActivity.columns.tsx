import { ArrowRightLeft, Trash } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Modal } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { DcaScheduleStatus } from "@/api/graphql/trade-orders"
import { AmountMobile } from "@/modules/trade/orders/columns/AmountMobile"
import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapMobile } from "@/modules/trade/orders/columns/SwapMobile"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import { OrderStatus } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.data"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"
import { TAsset } from "@/providers/assetsProvider"

export type MyRecentActivitySwap = {
  readonly from: TAsset
  readonly fromAmount: string
  readonly to: TAsset
  readonly toAmount: string
  readonly fillPrice: string
  readonly status: OrderStatus | null
  readonly link: string | null
}

const columnHelper = createColumnHelper<MyRecentActivitySwap>()

export const useMyRecentActivityColumns = () => {
  const { t } = useTranslation(["common", "trade"])
  const { isMobile } = useBreakpoints()

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
      id: "ations",
      cell: function Row({ row }) {
        const { status } = row.original
        const [confirmationModal, setConfirmationModal] = useState(false)

        return (
          status?.kind === "dca" &&
          status.status === DcaScheduleStatus.Created && (
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
              <Modal
                open={confirmationModal}
                onOpenChange={setConfirmationModal}
              >
                <TerminateDcaScheduleModalContent
                  scheduleId={status.scheduleId}
                  sold={status.sold}
                  total={status.total}
                  symbol={row.original.to.symbol}
                  onClose={() => setConfirmationModal(false)}
                />
              </Modal>
            </>
          )
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
      cell: ({ row }) => {
        return (
          <AmountMobile
            fromAmount={row.original.fromAmount}
            from={row.original.from}
            status={row.original.status?.status}
          />
        )
      },
    })

    return isMobile
      ? [fromToColumnMobile, statusColumnMobile]
      : [fromToColumn, fillPriceColumn, typeColumn, statusColumn, actionColumn]
  }, [t, isMobile])
}
