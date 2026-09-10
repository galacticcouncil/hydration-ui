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

import { DateText } from "@/components/RelativeDateText"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import { RoutedTradeData } from "@/modules/trade/orders/lib/types"

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
      header: () => (
        <Flex gap="s" align="center">
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

    const statusColumn = columnHelper.display({
      header: t("trade:trade.orders.myActivity.status"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => (
        <Flex direction="column" gap="xs">
          <SwapStatus />
          <DateText
            date={row.original.date}
            fw={500}
            fs="p6"
            color={getToken("text.medium")}
          />
        </Flex>
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

    const expandColumnMobile = columnHelper.display({
      id: "expand",
      size: 50,
      cell: () => <TableRowDetailsExpand />,
    })

    if (isMobile) {
      return [fromToColumn, expandColumnMobile]
    }

    return [fromToColumn, fillPriceColumn, statusColumn, actionColumn]
  }, [t, isMobile])
}
