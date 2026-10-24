import { markets } from "@galacticcouncil/money-market/core"
import {
  MoneyMarketProvider,
  useMoneyMarket,
} from "@galacticcouncil/money-market/react"
import type { CustomMarket } from "@galacticcouncil/money-market/types"
import { Flex, Select, Spinner } from "@galacticcouncil/ui/components"
import {
  Outlet,
  useMatch,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import { FC } from "react"

import { BreadcrumbBar } from "@/modules/layout/components/BreadcrumbBar"
import { Container, MainContent } from "@/modules/layout/components/Content"
import { SubNavBar } from "@/modules/layout/components/SubNavBar"
import { EModeSelect } from "@/modules/money-market/EModeSelect"
import { DEFAULT_MARKET } from "@/modules/money-market/hooks"
import { ReserveApyProvider } from "@/modules/money-market/ReserveApyProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

const MARKET_ITEMS = Object.values(markets).map((m) => ({
  key: m.market,
  label: m.marketTitle,
}))

/**
 * The selected market lives in the URL, so a reserve link opens in the market
 * it was clicked in: one address can be a reserve of several markets.
 */
export const MoneyMarketLayout: FC = () => {
  const { isReady } = useRpcProvider()
  const { config } = useMoneyMarket()
  const { market = DEFAULT_MARKET } = useSearch({ from: "/borrow" })
  const descriptor = markets[market]
  // the reserve detail swaps the sub nav for a breadcrumb back to the markets
  const isReserve = !!useMatch({
    from: "/borrow/markets/$address",
    shouldThrow: false,
  })

  return (
    <Container>
      {isReady ? (
        <MoneyMarketProvider config={config} market={descriptor}>
          <ReserveApyProvider>
            {isReserve ? (
              <BreadcrumbBar />
            ) : (
              <SubNavBar
                actions={
                  <Flex align="center" gap="m">
                    <MarketSelect />
                    <EModeSelect key={market} />
                  </Flex>
                }
              />
            )}
            <MainContent>
              <Outlet />
            </MainContent>
          </ReserveApyProvider>
        </MoneyMarketProvider>
      ) : (
        <Flex justify="center" p="xl">
          <Spinner />
        </Flex>
      )}
    </Container>
  )
}

/** Sits in the sub nav strip, so every page shares it. */
export const MarketSelect: FC = () => {
  const { market } = useSearch({ from: "/borrow" })
  const navigate = useNavigate()

  const onMarketChange = (next: CustomMarket) =>
    navigate({
      to: ".",
      search: { market: next },
    })

  if (!market) return null

  return (
    <Select
      label="Market"
      items={MARKET_ITEMS}
      value={market}
      onValueChange={onMarketChange}
    />
  )
}
