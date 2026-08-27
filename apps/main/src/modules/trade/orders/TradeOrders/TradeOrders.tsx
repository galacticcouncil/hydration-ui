import { userOpenOrdersCountQuery } from "@galacticcouncil/indexer/squid"
import { Paper, PaperProps, Separator } from "@galacticcouncil/ui/components"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { FC, useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useChainOrdersData } from "@/modules/trade/orders/TradeOrders/lib/useChainOrdersData"
import { MarketTransactions } from "@/modules/trade/orders/TradeOrders/MarketTransactions"
import { MyRecentActivity } from "@/modules/trade/orders/TradeOrders/MyRecentActivity"
import { OpenOrders } from "@/modules/trade/orders/TradeOrders/OpenOrders"
import { OrderHistory } from "@/modules/trade/orders/TradeOrders/OrderHistory"
import { TradeOrdersHeader } from "@/modules/trade/orders/TradeOrders/TradeOrdersHeader"

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

  const squidClient = useSquidClient()
  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const address = safeConvertSS58toPublicKey(accountAddress)

  const { data: openOrdersCountData } = useQuery(
    userOpenOrdersCountQuery(
      squidClient,
      address,
      allPairs ? [] : [assetIn, assetOut],
    ),
  )

  return (
    <Paper sx={{ overflow: "hidden" }} {...props}>
      <TradeOrdersHeader
        paginationProps={paginationProps}
        openOrdersCount={openOrdersCountData?.dcaSchedules?.totalCount ?? 0}
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
                />
              )
            case "orderHistory":
              return (
                <OrderHistory
                  paginationProps={paginationProps}
                  assetIds={assetIds}
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
