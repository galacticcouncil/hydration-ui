import { Paper, PaperProps, Separator } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useMemo, useState } from "react"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useIntentOrdersData } from "@/modules/trade/orders/lib/useIntentOrdersData"
import { useInvalidateOrdersOnExecution } from "@/modules/trade/orders/lib/useInvalidateOrdersOnExecution"
import { MarketTransactions } from "@/modules/trade/orders/TradeOrders/MarketTransactions"
import { MyRecentActivity } from "@/modules/trade/orders/TradeOrders/MyRecentActivity"
import { OpenOrders } from "@/modules/trade/orders/TradeOrders/OpenOrders"
import { OrderHistory } from "@/modules/trade/orders/TradeOrders/OrderHistory"
import {
  OrderHistoryKind,
  TradeOrdersHeader,
} from "@/modules/trade/orders/TradeOrders/TradeOrdersHeader"

type Props = PaperProps

export const TradeOrders: FC<Props> = (props) => {
  const { tab, allPairs, assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })
  const paginationProps = useDataTableUrlPagination(
    "/trade/_history",
    "page",
    10,
  )

  const assetIds = useMemo(
    () => (allPairs ? [] : [assetIn, assetOut]),
    [allPairs, assetIn, assetOut],
  )

  // New orders are always intents; past DCA schedules stay one click away
  const [kind, setKind] = useState<OrderHistoryKind>("intents")

  const { orders: intentOrders, isLoading, isError } = useIntentOrdersData()

  // Presence subscriptions miss executions, and a fill is a solver's unsigned
  // extrinsic rather than the trader's own tx, so neither the intent queries nor
  // the neckwork subtree would refresh without this.
  useInvalidateOrdersOnExecution()

  const openOrders = useMemo(
    () =>
      assetIds.length
        ? intentOrders.filter(
            ({ from, to }) =>
              assetIds.includes(from.id) || assetIds.includes(to.id),
          )
        : intentOrders,
    [intentOrders, assetIds],
  )

  return (
    <Paper sx={{ overflow: "hidden" }} {...props}>
      <TradeOrdersHeader
        paginationProps={paginationProps}
        openOrdersCount={openOrders.length}
        kind={kind}
        onKindChange={setKind}
      />
      <Separator />
      <div sx={{ overflowX: "auto" }}>
        {(() => {
          switch (tab) {
            case "myActivity":
              return (
                <MyRecentActivity
                  paginationProps={paginationProps}
                  assetIds={assetIds}
                />
              )
            case "openOrders":
              return (
                <OpenOrders
                  paginationProps={paginationProps}
                  orders={openOrders}
                  isLoading={isLoading}
                  isError={isError}
                />
              )
            case "orderHistory":
              return (
                <OrderHistory
                  paginationProps={paginationProps}
                  assetIds={assetIds}
                  kind={kind}
                />
              )
            case "marketTransactions":
              return (
                <MarketTransactions
                  paginationProps={paginationProps}
                  assetIds={assetIds}
                />
              )
          }
        })()}
      </div>
    </Paper>
  )
}
