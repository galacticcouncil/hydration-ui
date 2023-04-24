import { Page } from "components/Layout/Page/Page"
import { SContainer } from "./TradePage.styled"

import type { TxInfo } from "@galacticcouncil/apps"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"
import { useAccountStore, useStore } from "state/store"
import { z } from "zod"
import { MakeGenerics, useSearch } from "@tanstack/react-location"
import { useProviderRpcUrlStore } from "api/provider"
import { useApiPromise } from "utils/api"

export const TradeApp = createComponent({
  tagName: "gc-trade-app",
  elementClass: Apps.TradeApp,
  react: React,
  events: {
    onTxNew: "gc:tx:new" as EventName<CustomEvent<TxInfo>>,
  },
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
  const api = useApiPromise()
  const { account } = useAccountStore()
  const { createTransaction } = useStore()
  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL

  const rawSearch = useSearch<SearchGenerics>()
  const search = TradeAppSearch.safeParse(rawSearch)

  const handleSubmit = async (e: CustomEvent<TxInfo>) => {
    const { transaction, notification } = e.detail
    await createTransaction(
      {
        tx: api.tx(transaction.hex),
      },
      {
        onSuccess: () => {},
        onSubmitted: () => {},
        toast: {
          onLoading: (
            <span
              dangerouslySetInnerHTML={{
                __html: notification.processing.rawHtml,
              }}
            />
          ),
          onSuccess: (
            <span
              dangerouslySetInnerHTML={{
                __html: notification.success.rawHtml,
              }}
            />
          ),
          onError: (
            <span
              dangerouslySetInnerHTML={{
                __html: notification.failure.rawHtml,
              }}
            />
          ),
        },
      },
    )
  }

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
          onTxNew={(e) => handleSubmit(e)}
          accountName={account?.name}
          accountProvider={account?.provider}
          accountAddress={account?.address}
          apiAddress={rpcUrl}
          stableCoinAssetId="2"
          assetIn={search.success ? search.data.assetIn : undefined}
          assetOut={search.success ? search.data.assetOut : undefined}
          pools="Omni"
        />
      </SContainer>
    </Page>
  )
}
