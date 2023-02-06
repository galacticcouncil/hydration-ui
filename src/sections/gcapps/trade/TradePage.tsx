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

const chartEnabled = import.meta.env.VITE_FF_CHART_ENABLED === "true"
const chartDatasourceId = import.meta.env.VITE_FF_CHART_DATASOURCE

export function TradePage() {
  const { account } = useAccountStore()

  const rawSearch = useSearch<SearchGenerics>()
  const search = TradeAppSearch.safeParse(rawSearch)

  return (
    <Page>
      <SContainer>
        <TradeApp
          ref={(r) => {
            if (chartEnabled && r) {
              r.setAttribute("chart", "")
              r.setAttribute("chartDatasourceId", chartDatasourceId)
            }
          }}
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
