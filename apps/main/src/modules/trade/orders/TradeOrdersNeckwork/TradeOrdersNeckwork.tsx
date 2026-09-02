import { Paper, PaperProps, Separator } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { FC, useEffect } from "react"

import { useAccountIntents } from "@/api/intents"
import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useChainScheduleIds } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useChainOrdersData"
import { MyRecentActivityNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/MyRecentActivityNeckwork"
import { OpenOrdersNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/OpenOrdersNeckwork"
import { OrderHistoryNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/OrderHistoryNeckwork"
import { TradeOrdersTabs } from "@/modules/trade/orders/TradeOrdersTabs"

const TABS = ["myActivity", "openOrders", "orderHistory"] as const

type Props = PaperProps

export const TradeOrdersNeckwork: FC<Props> = (props) => {
  const { tab } = useSearch({
    from: "/trade/_history",
  })
  const navigate = useNavigate()
  const { account } = useAccount()

  const paginationProps = useDataTableUrlPagination(
    "/trade/_history",
    "page",
    10,
  )

  const resolvedTab = tab === "marketTransactions" ? "myActivity" : tab

  const { data: intents } = useAccountIntents(account?.address ?? "")

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
      <TradeOrdersTabs
        tabs={TABS}
        paginationProps={paginationProps}
        openOrdersCount={scheduleIds.length + (intents?.length ?? 0)}
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
