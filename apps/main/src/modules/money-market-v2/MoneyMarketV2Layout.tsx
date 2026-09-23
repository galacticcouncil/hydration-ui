import { markets } from "@galacticcouncil/money-market-v2/core"
import { MoneyMarketProvider } from "@galacticcouncil/money-market-v2/react"
import type { CustomMarket } from "@galacticcouncil/money-market-v2/types"
import {
  Flex,
  Select,
  Spinner,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Outlet, useNavigate, useSearch } from "@tanstack/react-router"
import { FC, useMemo } from "react"

import { createMoneyMarketConfig } from "@/modules/money-market-v2/config"
import { DEFAULT_MARKET, useUserAddress } from "@/modules/money-market-v2/hooks"
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
  const navigate = useNavigate()
  const user = useUserAddress()
  const descriptor = markets[market]

  const config = useMemo(
    () => (isReady ? createMoneyMarketConfig(papiClient) : null),
    [papiClient, isReady],
  )

  const onMarketChange = (next: CustomMarket) =>
    navigate({
      to: ".",
      search: { market: next === DEFAULT_MARKET ? undefined : next },
    })

  return (
    <Stack gap="xxl" p="base" maxWidth={1440} mx="auto">
      <Flex justify="space-between" align="flex-start" gap="base" wrap>
        <Flex direction="column" gap="s">
          <Text fs="h4" fw={600}>
            Money Market v2 — debug
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            {descriptor.market} · pool {descriptor.addresses.POOL} ·{" "}
            {user ?? "wallet not connected"}
          </Text>
        </Flex>
        <Select
          label="Market"
          items={MARKET_ITEMS}
          value={market}
          onValueChange={onMarketChange}
        />
      </Flex>

      {config ? (
        <MoneyMarketProvider config={config} market={descriptor}>
          <Outlet />
        </MoneyMarketProvider>
      ) : (
        <Flex justify="center" p="xl">
          <Spinner />
        </Flex>
      )}
    </Stack>
  )
}
