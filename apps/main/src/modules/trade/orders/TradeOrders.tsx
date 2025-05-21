import {
  Box,
  Flex,
  Paper,
  Separator,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SubpageItem, SubpageMenu } from "@/components/SubpageMenu"
import { SubpageMenuItem } from "@/components/SubpageMenu/SubpageMenuItem"
import { MarketTransactions } from "@/modules/trade/orders/MarketTransactions/MarketTransactions"
import { MyRecentActivity } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity"
import { OpenOrders } from "@/modules/trade/orders/OpenOrders/OpenOrders"
import { OpenOrdersBadge } from "@/modules/trade/orders/OpenOrders/OpenOrdersBadge"
import { OrderHistory } from "@/modules/trade/orders/OrderHistory/OrderHistory"
import { tradeOrderTabs } from "@/routes/trade/route"

export const TradeOrders: FC = () => {
  const { t } = useTranslation("trade")
  const { pathname } = useLocation()
  const { tab, allPairs } = useSearch({ from: "/trade/_history" })

  const navigate = useNavigate()

  return (
    <Paper>
      <Flex justify="space-between" align="center">
        <SubpageMenu
          sx={{ px: 20, py: getTokenPx("scales.paddings.l") }}
          items={tradeOrderTabs.map<SubpageItem>((tab) => {
            return {
              to: pathname,
              title: t(`trade.orders.${tab}`),
              search: { tab, allPairs },
            }
          })}
          renderItem={(item) => {
            const isOpenOrders =
              tab === "openOrders" && item.search?.tab === tab

            return (
              <Box position="relative">
                <SubpageMenuItem item={item} />
                {isOpenOrders && (
                  <OpenOrdersBadge
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      transform: "translate(25%, -25%)",
                    }}
                  >
                    5
                  </OpenOrdersBadge>
                )}
              </Box>
            )
          }}
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
      </Flex>
      <Separator />
      {(() => {
        switch (tab) {
          case "myActivity":
            return <MyRecentActivity />
          case "openOrders":
            return <OpenOrders />
          case "orderHistory":
            return <OrderHistory />
          case "marketTransactions":
            return <MarketTransactions />
        }
      })()}
    </Paper>
  )
}
