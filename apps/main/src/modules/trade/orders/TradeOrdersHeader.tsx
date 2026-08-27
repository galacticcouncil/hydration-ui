import {
  Flex,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TabItem, TabMenu } from "@/components/TabMenu"
import { TabMenuItem } from "@/components/TabMenu/TabMenuItem"
import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { TradeHistorySearchParams } from "@/routes/trade/_history/route"

export const tradeOrderTabs = [
  "myActivity",
  "openOrders",
  "orderHistory",
  "marketTransactions",
] as const

export type TradeOrderTab = (typeof tradeOrderTabs)[number]

type Props = {
  readonly paginationProps: PaginationProps
  readonly openOrdersCount: number
}

export const TradeOrdersHeader: FC<Props> = ({
  paginationProps,
  openOrdersCount,
}) => {
  const { t } = useTranslation("trade")
  const { pathname } = useLocation()
  const { tab, allPairs, assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const navigate = useNavigate()

  return (
    <Flex gap="m" align="center" px="xl">
      <TabMenu
        gap="base"
        my="l"
        horizontalEdgeOffset="xl"
        items={tradeOrderTabs.map<TabItem>((tab) => ({
          to: pathname,
          title: t(`trade.orders.${tab}`),
          search: {
            tab,
            allPairs,
            assetIn,
            assetOut,
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

      <ToggleRoot ml="auto" pl="xl">
        <ToggleLabel>
          {allPairs
            ? t("trade.orders.allPairs.on")
            : t("trade.orders.allPairs.off")}
        </ToggleLabel>
        <Toggle
          checked={allPairs}
          onCheckedChange={(checked) => {
            navigate({
              to: ".",
              search: {
                tab,
                allPairs: checked,
                assetIn,
                assetOut,
              },
              resetScroll: false,
            })
          }}
        />
      </ToggleRoot>
    </Flex>
  )
}
