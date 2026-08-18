import {
  DCA_OPEN_STATUSES,
  dcaSchedulesCountQuery,
} from "@galacticcouncil/indexer/neckwork"
import { Paper, PaperProps, Separator } from "@galacticcouncil/ui/components"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { FC, useEffect } from "react"

import { neckworkClient } from "@/api/provider"
import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useChainOrdersData } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useChainOrdersData"
import { MyRecentActivityNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/MyRecentActivityNeckwork"
import { OpenOrdersNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/OpenOrdersNeckwork"
import { OrderHistoryNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/OrderHistoryNeckwork"
import { TradeOrdersHeaderNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/TradeOrdersHeaderNeckwork"

type Props = PaperProps

export const TradeOrdersNeckwork: FC<Props> = (props) => {
  const { tab } = useSearch({
    from: "/trade/_history",
  })
  const navigate = useNavigate()

  const paginationProps = useDataTableUrlPagination(
    "/trade/_history",
    "page",
    10,
  )

  const resolvedTab = tab === "marketTransactions" ? "myActivity" : tab
  const isOpenOrdersTab = resolvedTab === "openOrders"

  const { orders: chainOrders } = useChainOrdersData({
    enabled: isOpenOrdersTab,
  })

  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const owner = safeConvertSS58toPublicKey(accountAddress)

  const { data: openOrdersCount } = useQuery(
    dcaSchedulesCountQuery(neckworkClient, {
      owner,
      statuses: DCA_OPEN_STATUSES,
      assetIds: [],
    }),
  )

  useEffect(() => {
    if (tab !== "marketTransactions") return

    void navigate({
      to: ".",
      search: (search) => ({ ...search, tab: "myActivity" }),
      replace: true,
      resetScroll: false,
    })
  }, [tab, navigate])

  return (
    <Paper sx={{ overflow: "hidden" }} {...props}>
      <TradeOrdersHeaderNeckwork
        paginationProps={paginationProps}
        openOrdersCount={
          isOpenOrdersTab ? chainOrders.length : (openOrdersCount ?? 0)
        }
      />
      <Separator />
      <div sx={{ overflowX: "auto" }}>
        {(() => {
          switch (resolvedTab) {
            case "myActivity":
              return (
                <MyRecentActivityNeckwork paginationProps={paginationProps} />
              )
            case "openOrders":
              return <OpenOrdersNeckwork paginationProps={paginationProps} />
            case "orderHistory":
              return <OrderHistoryNeckwork paginationProps={paginationProps} />
          }
        })()}
      </div>
    </Paper>
  )
}
