import { ArrowRightLeft, ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { ProjectRecraft } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  ExternalLink,
  Flex,
  Icon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { getSubscanLink } from "@/links/subscan"
import { AccountDate } from "@/modules/trade/orders/columns/AccountDate"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { TransactionType } from "@/modules/trade/orders/columns/TransactionType"
import { TAsset } from "@/providers/assetsProvider"

export type MarketTransaction = {
  readonly from: TAsset
  readonly fromAmount: string
  readonly to: TAsset
  readonly toAmount: string
  readonly type: TransactionType
  readonly fillPrice: string
  readonly address: string
  readonly timestamp: string
}

const columnHelper = createColumnHelper<MarketTransaction>()

export const useMarketTransactionsColumns = () => {
  const { t } = useTranslation(["common", "trade"])

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
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => {
        return <TransactionType type={row.original.type} />
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
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => {
        return (
          <AccountDate
            address={row.original.address}
            timestamp={row.original.timestamp}
          />
        )
      },
    })

    const actionColumn = columnHelper.display({
      id: "ations",
      cell: ({ row }) => {
        return (
          <Flex gap={9} align="center" justify="end">
            <ButtonIcon>
              <Icon component={ProjectRecraft} size={14} color="#FEFEFE" />
            </ButtonIcon>
            {/* TODO link */}
            <ExternalLink href={getSubscanLink(row.original)}>
              <Icon
                component={ChevronRight}
                size={16}
                color={getToken("icons.onContainer")}
              />
            </ExternalLink>
          </Flex>
        )
      },
    })

    return [fromToColumn, typeColumn, fillPriceColumn, dateColumn, actionColumn]
  }, [t])
}
