import { Paper, PaperProps, Separator } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useMemo, useState } from "react"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useIntentOrdersData } from "@/modules/trade/orders/lib/useIntentOrdersData"
import { useInvalidateOrdersOnExecution } from "@/modules/trade/orders/lib/useInvalidateOrdersOnExecution"
import { useChainOrdersData } from "@/modules/trade/orders/TradeOrders/lib/useChainOrdersData"
import { MarketTransactions } from "@/modules/trade/orders/TradeOrders/MarketTransactions"
import { MyRecentActivity } from "@/modules/trade/orders/TradeOrders/MyRecentActivity"
import { OpenOrders } from "@/modules/trade/orders/TradeOrders/OpenOrders"
import { OrderHistory } from "@/modules/trade/orders/TradeOrders/OrderHistory"
import {
  OrderHistoryKind,
  TradeOrdersHeader,
} from "@/modules/trade/orders/TradeOrders/TradeOrdersHeader"
import { useIsIceEnabled } from "@/states/intents"

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

  const isIceEnabled = useIsIceEnabled()
  const [pickedKind, setPickedKind] = useState<OrderHistoryKind | null>(null)

  const kind: OrderHistoryKind =
    pickedKind ?? (isIceEnabled ? "intents" : "dca")

  const { orders, isLoading } = useChainOrdersData()
  const { orders: intentOrders, isLoading: isIntentsLoading } =
    useIntentOrdersData()

  // Presence subscriptions miss executions, and a fill is a solver's unsigned
  // extrinsic rather than the trader's own tx, so neither the chain queries nor
  // the neckwork subtree would refresh without this.
  useInvalidateOrdersOnExecution()

  const openOrders = useMemo(() => {
    const all = [...intentOrders, ...orders]

    return assetIds.length
      ? all.filter(
          ({ from, to }) =>
            assetIds.includes(from.id) || assetIds.includes(to.id),
        )
      : all
  }, [orders, intentOrders, assetIds])

  return (
    <Paper sx={{ overflow: "hidden" }} {...props}>
      <TradeOrdersHeader
        paginationProps={paginationProps}
        openOrdersCount={openOrders.length}
        kind={kind}
        onKindChange={setPickedKind}
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
                  isLoading={isLoading || isIntentsLoading}
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
