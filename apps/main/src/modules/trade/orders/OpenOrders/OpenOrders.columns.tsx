import {
  ArrowRightLeft,
  SquareArrowOutUpRight,
  Trash,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ExternalLink,
  Flex,
  Icon,
  Modal,
  TableRowDetailsExpand,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { neckwork } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AmountMobile } from "@/modules/trade/orders/columns/AmountMobile"
import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { LimitOrderStatus } from "@/modules/trade/orders/columns/LimitOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapMobile } from "@/modules/trade/orders/columns/SwapMobile"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import {
  isDcaScheduleOrder,
  isIntentOrder,
  OrderData,
  OrderKind,
  OrderStatus,
} from "@/modules/trade/orders/lib/orderData"
import { useRemoveIntent } from "@/modules/trade/orders/lib/useRemoveIntent"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"

const columnHelper = createColumnHelper<OrderData>()

export const useOpenOrdersColumns = () => {
  const { t } = useTranslation(["common", "trade"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const fromToColumn = columnHelper.display({
      header: t("trade:trade.orders.openOrders.inOut"),
      cell: ({ row }) => {
        const order = row.original

        const fromAmount =
          order.kind === OrderKind.Limit
            ? order.fromAmountBudget
            : order.isOpenBudget
              ? order.fromAmountExecuted
              : order.fromAmountBudget

        const toAmount =
          order.kind === OrderKind.Limit
            ? order.toAmountBudget
            : order.isOpenBudget
              ? order.toAmountExecuted
              : undefined

        return (
          <SwapAmount
            fromAmount={fromAmount}
            toAmount={toAmount}
            from={order.from}
            to={order.to}
            showLogo
          />
        )
      },
    })

    const priceColumn = columnHelper.display({
      id: "price",

      header: () => (
        <Flex gap="s" align="center">
          {t("trade:trade.orders.openOrders.price")}
          <Icon
            size="xs"
            component={ArrowRightLeft}
            color={getToken("textButtons.small.hover")}
          />
        </Flex>
      ),
      cell: ({ row }) => {
        const order = row.original
        const { from, to, fromAmountExecuted, toAmountExecuted } = order

        const averagePrice =
          toAmountExecuted &&
          fromAmountExecuted &&
          Big(fromAmountExecuted).gt(0) &&
          Big(toAmountExecuted).gt(0)
            ? Big(fromAmountExecuted).div(toAmountExecuted).toString()
            : null

        const limitPrice =
          "limitPrice" in order
            ? order.limitPrice
            : order.fromAmountBudget &&
                order.toAmountBudget &&
                Big(order.toAmountBudget).gt(0)
              ? Big(order.fromAmountBudget).div(order.toAmountBudget).toString()
              : null

        return (
          <SwapPrice
            from={from}
            to={to}
            price={averagePrice ?? limitPrice}
            defaultInverted={
              order.kind === OrderKind.Limit ||
              ("limitPrice" in order && !!order.limitPrice)
            }
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
        return (
          <Flex justify="center">
            <SwapType
              type={row.original.kind}
              isLimit={
                "limitPrice" in row.original && !!row.original.limitPrice
              }
              isLegacyDca={isDcaScheduleOrder(row.original)}
            />
          </Flex>
        )
      },
    })

    const statusColumn = columnHelper.display({
      header: t("trade:trade.orders.openOrders.status"),
      cell: ({ row }) => {
        const order = row.original

        if (!order.status) return null

        if (
          order.kind === OrderKind.Limit &&
          order.status === OrderStatus.Created
        ) {
          return <LimitOrderStatus order={order} />
        }

        return (
          <DcaOrderStatus
            status={order.status}
            sold={order.fromAmountExecuted}
            total={order.fromAmountBudget}
            isOpenBudget={"isOpenBudget" in order && order.isOpenBudget}
            from={order.from}
          />
        )
      },
    })

    const actionColumn = columnHelper.display({
      id: "actions",
      cell: function Cell({ row }) {
        const [modal, setModal] = useState<"confirmation" | "none">("none")
        const removeIntent = useRemoveIntent()
        const order = row.original

        const isIntent = isIntentOrder(order)
        const isDcaSchedule = isDcaScheduleOrder(order)

        const explorerHref = isDcaSchedule
          ? neckwork.activityDca(order.scheduleId)
          : isIntent
            ? neckwork.intent(order.intentId)
            : null

        return (
          <Flex align="center" gap="base" justify="flex-end">
            {explorerHref && (
              <Tooltip
                text={t("openInExplorer")}
                size="small"
                asChild
                side="top"
              >
                <Button
                  sx={{ p: "base" }}
                  variant="muted"
                  outline
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  asChild
                >
                  <ExternalLink href={explorerHref}>
                    <Icon component={SquareArrowOutUpRight} size="s" />
                  </ExternalLink>
                </Button>
              </Tooltip>
            )}
            <Tooltip
              text={t("trade:trade.cancelOrder.cta")}
              size="small"
              asChild
              side="top"
            >
              <Button
                variant="danger"
                outline
                sx={{ p: "base" }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isIntent) {
                    removeIntent.mutate(order.intentId)
                  } else {
                    setModal("confirmation")
                  }
                }}
              >
                <Icon component={Trash} size="s" />
              </Button>
            </Tooltip>
            <TableRowDetailsExpand />
            {isDcaSchedule && (
              <Modal
                open={modal === "confirmation"}
                onOpenChange={() => setModal("none")}
              >
                <TerminateDcaScheduleModalContent
                  scheduleId={order.scheduleId}
                  sold={order.fromAmountExecuted}
                  total={order.fromAmountBudget}
                  symbol={order.from.symbol}
                  openBudget={order.isOpenBudget}
                  onClose={() => setModal("none")}
                />
              </Modal>
            )}
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
            total={row.original.fromAmountBudget}
            isOpenBudget={
              "isOpenBudget" in row.original && row.original.isOpenBudget
            }
            order={row.original}
          />
        </TableRowDetailsExpand>
      ),
    })

    if (isMobile) {
      return [fromToColumnMobile, statusColumnMobile]
    }

    return [fromToColumn, priceColumn, typeColumn, statusColumn, actionColumn]
  }, [t, isMobile])
}
