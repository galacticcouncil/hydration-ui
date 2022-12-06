import { Page } from "components/Layout/Page/Page"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent } from "@lit-labs/react"
import { useAccountStore } from "state/store"

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

export function TradePage() {
  const { account } = useAccountStore()

  const ref = React.useRef<Apps.TradeApp>(null)

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
              pools="Omni"
            />
          </TransactionCenter>
        </NotificationCenter>
      </div>
    </Page>
  )
}
