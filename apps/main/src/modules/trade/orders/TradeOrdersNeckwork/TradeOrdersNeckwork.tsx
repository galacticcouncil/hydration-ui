import { Paper, PaperProps, Separator } from "@galacticcouncil/ui/components"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { FC, useEffect } from "react"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useChainScheduleIds } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useChainOrdersData"
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

  const { scheduleIds } = useChainScheduleIds()

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
        openOrdersCount={scheduleIds.length}
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
