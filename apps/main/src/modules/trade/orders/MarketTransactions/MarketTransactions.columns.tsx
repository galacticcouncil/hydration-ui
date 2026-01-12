import { ArrowRightLeft, SubScan } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  ExternalLink,
  Flex,
  Icon,
  TableRowDetailsExpand,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AccountDate } from "@/modules/trade/orders/columns/AccountDate"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { TransactionType } from "@/modules/trade/orders/columns/TransactionType"
import { SwapData } from "@/modules/trade/orders/lib/useSwapsData"

const columnHelper = createColumnHelper<SwapData>()

export const useMarketTransactionsColumns = () => {
  const { t } = useTranslation(["common", "trade"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const fromToColumn = columnHelper.display({
      header: t("trade:trade.orders.marketTransactions.inOut"),
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

    const typeColumn = columnHelper.display({
      id: "type",
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => {
        return row.original.type && <TransactionType type={row.original.type} />
      },
    })

    const fillPriceColumn = columnHelper.display({
      id: "price",
      meta: {
        sx: { textAlign: "center" },
      },
      header: () => (
        <Flex gap={4} align="center" justify="center">
          {t("trade:trade.orders.marketTransactions.fillPrice")}
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

    const dateColumn = columnHelper.display({
      header: t("trade:trade.orders.marketTransactions.accountDate"),
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => (
        <Flex align="center" gap={6}>
          <AccountDate
            align="center"
            address={row.original.address}
            date={row.original.date}
          />
          {row.original.link && (
            <ButtonIcon asChild>
              <ExternalLink
                href={row.original.link}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon component={SubScan} size={16} />
              </ExternalLink>
            </ButtonIcon>
          )}
        </Flex>
      ),
    })

    const fromToColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.fromTo.mobile"),
      cell: ({ row }) => {
        return (
          <div>
            <SwapAmount
              fromAmount={row.original.fromAmount}
              from={row.original.from}
              toAmount={row.original.toAmount}
              to={row.original.to}
            />
            {row.original.type && <TransactionType type={row.original.type} />}
          </div>
        )
      },
    })

    const dateColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.marketTransactions.accountDate"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => (
        <TableRowDetailsExpand>
          <AccountDate
            align="end"
            address={row.original.address}
            date={row.original.date}
          />
        </TableRowDetailsExpand>
      ),
    })

    if (isMobile) {
      return [fromToColumnMobile, dateColumnMobile]
    }

    return [fromToColumn, typeColumn, fillPriceColumn, dateColumn]
  }, [t, isMobile])
}
