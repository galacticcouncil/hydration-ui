import { Page } from "components/Layout/Page/Page"
import { SContainer } from "./DcaPage.styled"

import type { TxInfo } from "@galacticcouncil/apps"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"
import { useAccountStore, useStore } from "state/store"
import { useProviderRpcUrlStore } from "api/provider"
import { useApiPromise } from "utils/api"

export const DcaApp = createComponent({
  tagName: "gc-dca-app",
  elementClass: Apps.DcaApp,
  react: React,
  events: {
    onDcaSchedule: "gc:tx:scheduleDca" as EventName<CustomEvent<TxInfo>>,
    onDcaTerminate: "gc:tx:terminateDca" as EventName<CustomEvent<TxInfo>>,
  },
})

const chartDatasourceId = import.meta.env.VITE_FF_CHART_DATASOURCE

export function DcaPage() {
  const api = useApiPromise()
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
    <Page>
      <SContainer>
        <DcaApp
          ref={(r) => {
            if (r) {
              r.setAttribute("chart", "")
              r.setAttribute("chartDatasourceId", chartDatasourceId)
            }
          }}
          onDcaSchedule={(e) => handleSubmit(e)}
          onDcaTerminate={(e) => handleSubmit(e)}
          accountName={account?.name}
          accountProvider={account?.provider}
          accountAddress={account?.address}
          apiAddress={rpcUrl}
          stableCoinAssetId="2"
          pools="Omni"
        />
      </SContainer>
    </Page>
  )
}
