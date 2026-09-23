import { markets } from "@galacticcouncil/money-market-v2/core"
import { MoneyMarketProvider } from "@galacticcouncil/money-market-v2/react"
import type { CustomMarket } from "@galacticcouncil/money-market-v2/types"
import { Flex, Select, Spinner } from "@galacticcouncil/ui/components"
import { Outlet, useNavigate, useSearch } from "@tanstack/react-router"
import { FC, useMemo } from "react"

import { BreadcrumbBar } from "@/modules/layout/components/BreadcrumbBar"
import { Container, MainContent } from "@/modules/layout/components/Content"
import { createMoneyMarketConfig } from "@/modules/money-market-v2/config"
import { DEFAULT_MARKET } from "@/modules/money-market-v2/hooks"
import { useRpcProvider } from "@/providers/rpcProvider"

const MARKET_ITEMS = Object.values(markets).map((m) => ({
  key: m.market,
  label: m.marketTitle,
}))

/**
 * A developer-only surface for comparing money-market-v2's numbers against the
 * live borrow UI. It reads exclusively from `@galacticcouncil/money-market-v2`
 * and lays the numbers out like the /borrow pages so the two can be read side
 * by side. Nothing here signs, and nothing is meant to ship to users - strings
 * stay inline rather than going through i18n for the same reason.
 *
 * The selected market lives in the URL, so a reserve link opens in the market
 * it was clicked in: one address can be a reserve of several markets.
 */
export const MoneyMarketV2Layout: FC = () => {
  const { papiClient, isReady } = useRpcProvider()
  const { market = DEFAULT_MARKET } = useSearch({ from: "/money-market" })
  const descriptor = markets[market]

  const config = useMemo(
    () => (isReady ? createMoneyMarketConfig(papiClient) : null),
    [papiClient, isReady],
  )

  return (
    <Container>
      {config ? (
        <MoneyMarketProvider config={config} market={descriptor}>
          <BreadcrumbBar />
          <MainContent>
            <Outlet />
          </MainContent>
        </MoneyMarketProvider>
      ) : (
        <Flex justify="center" p="xl">
          <Spinner />
        </Flex>
      )}
    </Container>
  )
}

/** Each page places this in its own header row. */
export const MarketSelect: FC = () => {
  const { market = DEFAULT_MARKET } = useSearch({ from: "/money-market" })
  const navigate = useNavigate()

  const onMarketChange = (next: CustomMarket) =>
    navigate({
      to: ".",
      search: { market: next === DEFAULT_MARKET ? undefined : next },
    })

  return (
    <Select
      label="Market"
      items={MARKET_ITEMS}
      value={market}
      onValueChange={onMarketChange}
    />
  )
}
