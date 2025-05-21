import { ArrowRightLeft } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TradeOperation } from "@/api/graphql/trade-orders"
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
  readonly type: TradeOperation | null
  readonly fillPrice: string
  readonly link: string | null
  readonly address: string | null
  readonly timestamp: string
}

const columnHelper = createColumnHelper<MarketTransaction>()

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
        sx: { textAlign: isMobile ? "end" : "center" },
      },
      cell: ({ row }) => {
        return (
          <AccountDate
            align={isMobile ? "end" : "center"}
            address={row.original.address}
            timestamp={row.original.timestamp}
          />
        )
      },
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

    return isMobile
      ? [fromToColumnMobile, dateColumn]
      : [fromToColumn, typeColumn, fillPriceColumn, dateColumn]
  }, [t, isMobile])
}
