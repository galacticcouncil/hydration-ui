import { Paper, PaperProps, Separator } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC } from "react"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { MarketTransactions } from "@/modules/trade/orders/MarketTransactions/MarketTransactions"
import { MyRecentActivity } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity"
import { OpenOrders } from "@/modules/trade/orders/OpenOrders/OpenOrders"
import { OrderHistory } from "@/modules/trade/orders/OrderHistory/OrderHistory"
import { TradeOrdersHeader } from "@/modules/trade/orders/TradeOrdersHeader"

type Props = PaperProps

export const TradeOrders: FC<Props> = (props) => {
  const { tab, allPairs } = useSearch({
    from: "/trade/_history",
  })

  const paginationProps = useDataTableUrlPagination(
    "/trade/_history",
    "page",
    10,
  )

  return (
    <Paper sx={{ overflow: "hidden" }} {...props}>
      <TradeOrdersHeader paginationProps={paginationProps} />
      <Separator />
      <div sx={{ overflowX: "auto" }}>
        {(() => {
          switch (tab) {
            case "myActivity":
              return (
                <MyRecentActivity
                  allPairs={allPairs}
                  paginationProps={paginationProps}
                />
              )
            case "openOrders":
              return (
                <OpenOrders
                  allPairs={allPairs}
                  paginationProps={paginationProps}
                />
              )
            case "orderHistory":
              return (
                <OrderHistory
                  allPairs={allPairs}
                  paginationProps={paginationProps}
                />
              )
            case "marketTransactions":
              return (
                <MarketTransactions
                  allPairs={allPairs}
                  paginationProps={paginationProps}
                />
              )
          }
        })()}
      </div>
    </Paper>
  )
}
