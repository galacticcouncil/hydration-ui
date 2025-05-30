import { Paper, Separator } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC } from "react"

import { MarketTransactions } from "@/modules/trade/orders/MarketTransactions/MarketTransactions"
import { MyRecentActivity } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity"
import { OpenOrders } from "@/modules/trade/orders/OpenOrders/OpenOrders"
import { OrderHistory } from "@/modules/trade/orders/OrderHistory/OrderHistory"
import { TradeOrdersHeader } from "@/modules/trade/orders/TradeOrdersHeader"

export const TradeOrders: FC = () => {
  const { tab, allPairs } = useSearch({
    from: "/trade/_history",
  })

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <TradeOrdersHeader />
      <Separator />
      <div sx={{ overflowX: "auto" }}>
        {(() => {
          switch (tab) {
            case "myActivity":
              return <MyRecentActivity allPairs={allPairs} />
            case "openOrders":
              return <OpenOrders allPairs={allPairs} />
            case "orderHistory":
              return <OrderHistory allPairs={allPairs} />
            case "marketTransactions":
              return <MarketTransactions allPairs={allPairs} />
          }
        })()}
      </div>
    </Paper>
  )
}
