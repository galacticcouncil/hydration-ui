import { userOpenOrdersCountQuery } from "@galacticcouncil/indexer/squid"
import {
  Flex,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"
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
}

export const TradeOrdersHeader: FC<Props> = ({ paginationProps }) => {
  const { t } = useTranslation("trade")
  const { pathname } = useLocation()
  const { tab, allPairs, assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

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

  const openOrdersCount = openOrdersCountData?.dcaSchedules?.totalCount ?? 0

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
              search: { tab, allPairs: checked, assetIn, assetOut },
              resetScroll: false,
            })
          }}
        />
      </ToggleRoot>
    </Flex>
  )
}
