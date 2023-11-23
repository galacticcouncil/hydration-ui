import { SContainer } from "./DcaPage.styled"

import type { TxInfo } from "@galacticcouncil/apps"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"
import { useAccountStore, useStore } from "state/store"
import { useProviderRpcUrlStore } from "api/provider"
import { useRpcProvider } from "providers/rpcProvider"

export const DcaApp = createComponent({
  tagName: "gc-dca-app",
  elementClass: Apps.DcaApp,
  react: React,
  events: {
    onDcaSchedule: "gc:tx:scheduleDca" as EventName<CustomEvent<TxInfo>>,
    onDcaTerminate: "gc:tx:terminateDca" as EventName<CustomEvent<TxInfo>>,
  },
})

const pools = import.meta.env.VITE_FF_POOLS
const indexerUrl = import.meta.env.VITE_INDEXER_URL
const grafanaUrl = import.meta.env.VITE_GRAFANA_URL
const grafanaDsn = import.meta.env.VITE_GRAFANA_DSN
const stableCoinAssetId = import.meta.env.VITE_STABLECOIN_ASSET_ID

export function DcaPage() {
  const { api } = useRpcProvider()
  const { account } = useAccountStore()
  const { createTransaction } = useStore()
  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL

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
    <SContainer>
      <DcaApp
        ref={(r) => {
          r && r.setAttribute("chart", "")
        }}
        apiAddress={rpcUrl}
        pools={pools}
        stableCoinAssetId={stableCoinAssetId}
        accountName={account?.name}
        accountProvider={account?.provider}
        accountAddress={account?.address}
        indexerUrl={indexerUrl}
        grafanaUrl={grafanaUrl}
        grafanaDsn={grafanaDsn}
        onDcaSchedule={(e) => handleSubmit(e)}
        onDcaTerminate={(e) => handleSubmit(e)}
      />
    </SContainer>
  )
}
