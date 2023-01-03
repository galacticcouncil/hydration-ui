import { Page } from "components/Layout/Page/Page"
import { SContainer } from "./TradePage.styled"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent } from "@lit-labs/react"
import { useAccountStore } from "state/store"
import { z } from "zod"
import { MakeGenerics, useSearch } from "@tanstack/react-location"

export const TradeApp = createComponent({
  tagName: "gc-trade-app",
  elementClass: Apps.TradeApp,
  react: React,
})

const TradeAppSearch = z.object({
  assetIn: z
    .number()
    .transform((value) => String(value))
    .optional(),
  assetOut: z
    .number()
    .transform((value) => String(value))
    .optional(),
})

type SearchGenerics = MakeGenerics<{
  Search: z.infer<typeof TradeAppSearch>
}>

export function TradePage() {
  const { account } = useAccountStore()

  const ref = React.useRef<Apps.TradeApp>(null)
  const rawSearch = useSearch<SearchGenerics>()
  const search = TradeAppSearch.safeParse(rawSearch)

  return (
    <Page>
      <SContainer>
        <TradeApp
          ref={ref}
          accountName={account?.name}
          accountProvider={account?.provider}
          accountAddress={account?.address}
          apiAddress={import.meta.env.VITE_PROVIDER_URL}
          stableCoinAssetId="2"
          assetIn={search.success ? search.data.assetIn : undefined}
          assetOut={search.success ? search.data.assetOut : undefined}
          pools="Omni"
        />
      </SContainer>
    </Page>
  )
}
