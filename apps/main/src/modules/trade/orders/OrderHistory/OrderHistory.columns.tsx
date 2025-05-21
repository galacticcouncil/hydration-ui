import { ArrowRightLeft } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AmountMobile } from "@/modules/trade/orders/columns/AmountMobile"
import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapMobile } from "@/modules/trade/orders/columns/SwapMobile"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"

const columnHelper = createColumnHelper<OrderData>()

export const useOrderHistoryColumns = () => {
  const { t } = useTranslation(["common", "trade"])
  const { isDesktop } = useBreakpoints()

  return useMemo(() => {
    const fromToColumn = columnHelper.display({
      header: t("trade:trade.orders.orderHistory.inOut"),
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

    const fillPriceColumn = columnHelper.display({
      id: "price",
      meta: {
        sx: { textAlign: "center" },
      },
      header: () => (
        <Flex gap={4} align="center" justify="center">
          {t("trade:trade.orders.orderHistory.fillPrice")}
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
      header: t("trade:trade.orders.orderHistory.type"),
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => {
        return <SwapType type={row.original.kind} />
      },
    })

    const statusColumn = columnHelper.display({
      header: t("trade:trade.orders.orderHistory.status"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) =>
        row.original.status && <DcaOrderStatus status={row.original.status} />,
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
        <AmountMobile
          fromAmount={row.original.fromAmountExecuted}
          from={row.original.from}
          status={row.original.status}
        />
      ),
    })

    return !isDesktop
      ? [fromToColumnMobile, statusColumnMobile]
      : [fromToColumn, fillPriceColumn, typeColumn, statusColumn]
  }, [t, isDesktop])
}
