import { Page } from "components/Layout/Page/Page"

import * as React from "react"
import { createComponent } from "@lit-labs/react"
import { TradeSpa as LitTradeSpa } from "@galacticcouncil/trade-app"
import { useAccountStore } from "state/store"

export const TradeSpa = createComponent({
  tagName: "gc-trade-spa",
  elementClass: LitTradeSpa,
  react: React,
})

export function TradePage() {
  const { account } = useAccountStore()

  return (
    <Page>
      <TradeSpa
        accountName={account?.name}
        accountProvider={account?.provider}
        accountAddress={account?.address}
        apiAddress={import.meta.env.VITE_PROVIDER_URL}
      />
    </Page>
  )
}
