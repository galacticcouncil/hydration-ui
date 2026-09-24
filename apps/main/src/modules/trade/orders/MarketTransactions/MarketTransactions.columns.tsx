import {
  ArrowRightLeft,
  SquareArrowOutUpRight,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ExternalLink,
  Flex,
  Icon,
  TableRowDetailsExpand,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AccountDate } from "@/modules/trade/orders/columns/AccountDate"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import { OrderKind, SwapData } from "@/modules/trade/orders/lib/types"

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
            showLogo
          />
        )
      },
    })

    const typeColumn = columnHelper.display({
      id: "type",
      header: t("trade:trade.orders.marketTransactions.type"),
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => {
        const { status } = row.original

        return (
          status && (
            <Flex justify="center">
              <SwapType
                type={status.kind === "marketDca" ? OrderKind.Dca : status.kind}
              />
            </Flex>
          )
        )
      },
    })

    const fillPriceColumn = columnHelper.display({
      id: "price",
      meta: {
        sx: { textAlign: "center" },
      },
      header: () => (
        <Flex gap="s" align="center">
          {t("trade:trade.orders.marketTransactions.fillPrice")}
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

    const dateColumn = columnHelper.display({
      header: t("trade:trade.orders.marketTransactions.accountDate"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => (
        <AccountDate
          align="flex-end"
          address={row.original.address}
          date={row.original.date}
        />
      ),
    })

    const actionColumn = columnHelper.display({
      id: "actions",
      size: 50,
      cell: ({ row }) => {
        if (!row.original.link) return null

        return (
          <Flex align="center" justify="end" gap="base">
            <Tooltip text={t("openInExplorer")} size="small" asChild side="top">
              <Button
                sx={{ p: "base" }}
                variant="muted"
                outline
                onClick={(e) => {
                  e.stopPropagation()
                }}
                asChild
              >
                <ExternalLink href={row.original.link}>
                  <Icon component={SquareArrowOutUpRight} size="s" />
                </ExternalLink>
              </Button>
            </Tooltip>
          </Flex>
        )
      },
    })

    const fromToColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.fromTo.mobile"),
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

    const dateColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.marketTransactions.accountDate"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => {
        const { status } = row.original

        return (
          <TableRowDetailsExpand>
            {status && (
              <Flex justify="center">
                <SwapType
                  type={
                    status.kind === "marketDca" ? OrderKind.Dca : status.kind
                  }
                />
              </Flex>
            )}
          </TableRowDetailsExpand>
        )
      },
    })

    if (isMobile) {
      return [fromToColumnMobile, dateColumnMobile]
    }

    return [fromToColumn, typeColumn, fillPriceColumn, dateColumn, actionColumn]
  }, [t, isMobile])
}
