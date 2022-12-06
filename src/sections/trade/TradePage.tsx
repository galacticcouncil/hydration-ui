import { Page } from "components/Layout/Page/Page"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"
import { useAccountStore } from "state/store"
import { MakeGenerics, useSearch } from "@tanstack/react-location"
import { z } from "zod"
import { Spinner } from "components/Spinner/Spinner.styled"

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
  events: {
    onInit: "gc:init" as EventName<CustomEvent>,
  },
})

const TradeAppSearch = z.object({
  type: z.union([z.literal("assetIn"), z.literal("assetOut")]),
  id: z.number().transform((value) => String(value)),
})

type SearchGenerics = MakeGenerics<{
  Search: z.infer<typeof TradeAppSearch>
}>

export function TradePage() {
  const { account } = useAccountStore()

  const search = useSearch<SearchGenerics>()

  const [loaded, setLoaded] = React.useState(false)
  const ref = React.useRef<Apps.TradeApp>(null)

  return (
    <Page>
      <div sx={{ flex: "column", align: "center" }}>
        {!loaded && <Spinner width={64} height={64} />}
        <NotificationCenter>
          <TransactionCenter>
            <TradeApp
              ref={ref}
              css={{ display: loaded ? "block" : "none" }}
              accountName={account?.name}
              accountProvider={account?.provider}
              accountAddress={account?.address}
              apiAddress={import.meta.env.VITE_PROVIDER_URL}
              pools="Omni"
              onInit={() => {
                const app = ref.current
                const safeSearch = TradeAppSearch.safeParse(search)

                if (app != null && safeSearch.success) {
                  const asset = safeSearch.data
                  app.setInitialAssets(asset.type, asset.id)
                }

                setLoaded(true)
              }}
            />
          </TransactionCenter>
        </NotificationCenter>
      </div>
    </Page>
  )
}
