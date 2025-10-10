import { userOpenOrdersCountQuery } from "@galacticcouncil/indexer/squid"
import {
  Box,
  Flex,
  Grid,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"
import { TabItem, TabMenu } from "@/components/TabMenu"
import { TabMenuItem } from "@/components/TabMenu/TabMenuItem"
import { OpenOrdersBadge } from "@/modules/trade/orders/OpenOrders/OpenOrdersBadge"
import { TradeHistorySearchParams } from "@/routes/trade/_history/route"

export const tradeOrderTabs = [
  "myActivity",
  "openOrders",
  "orderHistory",
  "marketTransactions",
] as const

export type TradeOrderTab = (typeof tradeOrderTabs)[number]

export const TradeOrdersHeader = () => {
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
    <Grid
      sx={{ overflowX: "auto" }}
      columnTemplate="1fr auto"
      columnGap={8}
      px={20}
      py={getTokenPx("scales.paddings.l")}
    >
      <TabMenu
        gap={8}
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
        renderItem={(item) => (
          <Box position="relative">
            <TabMenuItem
              size="small"
              item={item}
              variant="muted"
              sx={{ px: 10 }}
            />
            {item.search?.tab === ("openOrders" satisfies TradeOrderTab) &&
              openOrdersCount > 0 && (
                <OpenOrdersBadge
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    transform: "translate(25%, -25%)",
                  }}
                >
                  {openOrdersCount}
                </OpenOrdersBadge>
              )}
          </Box>
        )}
      />
      <Flex gap={12} align="center">
        <ToggleRoot>
          <ToggleLabel>{t("trade.orders.allPairs")}</ToggleLabel>
          <Toggle
            checked={allPairs}
            onCheckedChange={(checked) => {
              navigate({
                to: ".",
                search: { tab, allPairs: checked },
                resetScroll: false,
              })
            }}
          />
        </ToggleRoot>
      </Flex>
    </Grid>
  )
}
