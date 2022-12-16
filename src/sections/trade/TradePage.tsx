import { Page } from "components/Layout/Page/Page"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent } from "@lit-labs/react"
import { useAccountStore } from "state/store"
import { z } from "zod"
import { MakeGenerics, useSearch } from "@tanstack/react-location"

const NotificationCenter = createComponent({
  tagName: "gc-notification-center",
  elementClass: Apps.NotificationCenter,
  react: React,
})

const TransactionCenter = createComponent({
  tagName: "gc-transaction-center",
  elementClass: Apps.TransactionCenter,
  react: React,
})

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
      <div>
        <NotificationCenter>
          <TransactionCenter>
            <TradeApp
              ref={ref}
              accountName={account?.name}
              accountProvider={account?.provider}
              accountAddress={account?.address}
              apiAddress={import.meta.env.VITE_PROVIDER_URL}
              assetIn={search.success ? search.data.assetIn : undefined}
              assetOut={search.success ? search.data.assetOut : undefined}
              pools="Omni"
            />
          </TransactionCenter>
        </NotificationCenter>
      </div>
    </Page>
  )
}
