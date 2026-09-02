import { Flex } from "@galacticcouncil/ui/components"
import { useLocation, useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TabItem, TabMenu } from "@/components/TabMenu"
import { TabMenuItem } from "@/components/TabMenu/TabMenuItem"
import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { TradeOrderTab } from "@/modules/trade/orders/TradeOrdersHeader"
import { TradeHistorySearchParams } from "@/routes/trade/_history/route"

const TABS = ["myActivity", "openOrders", "orderHistory"] as const

const TAB_TITLE_KEYS = {
  myActivity: "trade.orders.myTrades",
  openOrders: "trade.orders.openOrders",
  orderHistory: "trade.orders.orderHistory",
} as const

type Props = {
  readonly paginationProps: PaginationProps
  readonly openOrdersCount: number
}

export const TradeOrdersHeaderNeckwork: FC<Props> = ({
  paginationProps,
  openOrdersCount,
}) => {
  const { t } = useTranslation("trade")
  const { pathname } = useLocation()
  const { allPairs, assetIn, assetOut, destPlatform } = useSearch({
    from: "/trade/_history",
  })

  return (
    <Flex align="center" px="xl">
      <TabMenu
        gap="base"
        my="l"
        horizontalEdgeOffset="xl"
        items={TABS.map<TabItem>((tab) => ({
          to: pathname,
          title: t(TAB_TITLE_KEYS[tab]),
          search: {
            tab,
            allPairs,
            assetIn,
            assetOut,
            destPlatform,
          } satisfies TradeHistorySearchParams,
          resetScroll: false,
        }))}
        onClick={() => paginationProps.onPageClick(1)}
        renderItem={(item) => (
          <TabMenuItem
            size="small"
            item={item}
            variant="muted"
            badge={
              item.search?.tab === ("openOrders" satisfies TradeOrderTab) &&
              openOrdersCount > 0
                ? openOrdersCount
                : undefined
            }
          />
        )}
      />
    </Flex>
  )
}
