import { ClassNames } from "@emotion/react"
import { ArrowRightLeft } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  TableRowDetailsExpand,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { DcaOrderStatus } from "@/modules/trade/orders/columns/DcaOrderStatus"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapMobile } from "@/modules/trade/orders/columns/SwapMobile"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import { OrderKind } from "@/modules/trade/orders/lib/useOrdersData"
import { RoutedTradeData } from "@/modules/trade/orders/lib/useRoutedTradesData"

const columnHelper = createColumnHelper<RoutedTradeData>()

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
            showLogo
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
        <Flex gap="s" align="center" justify="center">
          {t("trade:trade.orders.myActivity.fillPrice")}
          <Icon
            size="xs"
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
          row.original.status && (
            <Flex justify="center">
              <SwapType type={row.original.status.kind} />
            </Flex>
          )
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

        return status.kind === OrderKind.Dca ||
          status.kind === OrderKind.DcaRolling ? (
          status.status && <DcaOrderStatus status={status.status} isDcaSwap />
        ) : (
          <SwapStatus />
        )
      },
    })

    const fromToColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.fromTo.mobile"),
      cell: ({ row }) => {
        return (
          <ClassNames>
            {({ css }) => (
              <TableRowDetailsExpand
                containerClassName={css`
                  justify-content: space-between;
                `}
              >
                <SwapMobile from={row.original.from} to={row.original.to} />
              </TableRowDetailsExpand>
            )}
          </ClassNames>
        )
      },
    })

    if (isMobile) {
      return [fromToColumnMobile]
    }

    return [fromToColumn, fillPriceColumn, typeColumn, statusColumn]
  }, [t, isMobile])
}
