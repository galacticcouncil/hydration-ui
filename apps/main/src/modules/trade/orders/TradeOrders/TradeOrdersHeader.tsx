import {
  Flex,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TabItem, TabMenu } from "@/components/TabMenu"
import { TabMenuItem } from "@/components/TabMenu/TabMenuItem"
import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { useRpcProvider } from "@/providers/rpcProvider"
import { TradeHistorySearchParams } from "@/routes/trade/_history/route"

const PAIR_FILTER_ENABLED = false

export const tradeOrderTabs = [
  "myActivity",
  "openOrders",
  "orderHistory",
  "marketTransactions",
] as const

export type TradeOrderTab = (typeof tradeOrderTabs)[number]

/**
 * Order History shows ONE source at a time. The two endpoints each page over
 * their own whole set, so a merged view would have to give up server
 * pagination — see wayfinder ticket 03. The cut is by SOURCE, not by order
 * kind: "intents" holds both TWAP and limit intents, because they are one
 * request.
 */
export const orderHistoryKinds = ["dca", "intents"] as const

export type OrderHistoryKind = (typeof orderHistoryKinds)[number]

const ORDER_HISTORY_KIND_KEYS = {
  dca: "trade.orders.orderHistory.source.dca",
  intents: "trade.orders.orderHistory.source.intents",
} as const satisfies Record<OrderHistoryKind, string>

const TAB_TITLE_KEYS = {
  myActivity: "trade.orders.myTrades",
  openOrders: "trade.orders.openOrders",
  orderHistory: "trade.orders.orderHistory",
  marketTransactions: "trade.orders.marketTransactions",
} as const satisfies Record<TradeOrderTab, string>

type PairFilter = "all" | "current"

type Props = {
  readonly tabs?: ReadonlyArray<TradeOrderTab>
  readonly paginationProps: PaginationProps
  readonly openOrdersCount: number
  /** Only the neckwork container reads the `kind` param; the fork one ignores it. */
  readonly sourceToggle?: boolean
}

export const TradeOrdersHeader: FC<Props> = ({
  tabs = tradeOrderTabs,
  paginationProps,
  openOrdersCount,
  sourceToggle = false,
}) => {
  const { t } = useTranslation("trade")
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { allPairs, assetIn, assetOut, destPlatform, tab, kind } = useSearch({
    from: "/trade/_history",
  })
  const { featureFlags } = useRpcProvider()

  // Gated on the chain having the pallet, NOT on the user's ICE opt-in: a
  // trader who switches intents off in settings still has intents to look back
  // at.
  const showSourceToggle =
    sourceToggle &&
    featureFlags.isIceEnabled &&
    tab === ("orderHistory" satisfies TradeOrderTab)

  return (
    <Flex align="center" px="xl">
      <TabMenu
        gap="base"
        my="l"
        horizontalEdgeOffset="xl"
        items={tabs.map<TabItem>((tab) => ({
          to: pathname,
          title: t(TAB_TITLE_KEYS[tab]),
          search: {
            tab,
            allPairs,
            assetIn,
            assetOut,
            destPlatform,
            kind,
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
      {showSourceToggle && (
        <Flex ml="auto" pl="xl" sx={{ flexShrink: 0 }}>
          <ToggleGroup<OrderHistoryKind>
            type="single"
            size="small"
            value={kind}
            onValueChange={(value) => {
              if (!value) return

              navigate({
                to: ".",
                search: (search) => ({ ...search, kind: value, page: 1 }),
                resetScroll: false,
              })
            }}
          >
            {orderHistoryKinds.map((value) => (
              <ToggleGroupItem key={value} value={value}>
                {t(ORDER_HISTORY_KIND_KEYS[value])}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Flex>
      )}
      {PAIR_FILTER_ENABLED && (
        <Flex ml="auto" pl="xl" sx={{ flexShrink: 0 }}>
          <ToggleGroup<PairFilter>
            type="single"
            size="small"
            value={allPairs ? "all" : "current"}
            onValueChange={(value) => {
              if (!value) return

              navigate({
                to: ".",
                search: (search) => ({
                  ...search,
                  allPairs: value === "all",
                  page: 1,
                }),
                resetScroll: false,
              })
            }}
          >
            <ToggleGroupItem value="all">
              {t("trade.orders.allPairs.on")}
            </ToggleGroupItem>
            <ToggleGroupItem value="current">
              {t("trade.orders.allPairs.off")}
            </ToggleGroupItem>
          </ToggleGroup>
        </Flex>
      )}
    </Flex>
  )
}
