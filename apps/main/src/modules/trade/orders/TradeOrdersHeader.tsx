import {
  Box,
  Flex,
  Grid,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { userOpenOrdersCountQuery } from "@/api/graphql/trade-orders"
import { useSquidClient } from "@/api/provider"
import { SubpageItem, SubpageMenu } from "@/components/SubpageMenu"
import { SubpageMenuItem } from "@/components/SubpageMenu/SubpageMenuItem"
import { OpenOrdersBadge } from "@/modules/trade/orders/OpenOrders/OpenOrdersBadge"

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
  const address = account?.address ?? ""

  const { data } = useQuery(
    userOpenOrdersCountQuery(
      squidClient,
      address,
      allPairs ? [] : [assetIn, assetOut],
    ),
  )

  const openOrdersCount = data?.dcaSchedules?.totalCount ?? 0

  const navigate = useNavigate()

  return (
    <Box px={20} py={getTokenPx("scales.paddings.l")}>
      <Grid
        sx={{ overflowX: "auto" }}
        columnTemplate="1fr auto"
        align="center"
        columnGap={20}
      >
        <SubpageMenu
          sx={{ overflow: "unset" }}
          items={tradeOrderTabs.map<SubpageItem>((tab) => ({
            to: pathname,
            title: t(`trade.orders.${tab}`),
            search: { tab, allPairs },
          }))}
          renderItem={(item) => (
            <Box position="relative">
              <SubpageMenuItem item={item} />
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
                navigate({ to: ".", search: { tab, allPairs: checked } })
              }}
            />
          </ToggleRoot>
        </Flex>
      </Grid>
    </Box>
  )
}
