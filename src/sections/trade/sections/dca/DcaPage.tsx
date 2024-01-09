import { SContainer } from "./DcaPage.styled"

import type { TxInfo } from "@galacticcouncil/apps"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"
import { useStore } from "state/store"
import { useProviderRpcUrlStore } from "api/provider"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { isEvmAccount } from "utils/evm"
import { NATIVE_ASSET_ID } from "utils/api"
import { useAccountCurrency } from "api/payments"
import { useDisplayAssetStore } from "utils/displayAsset"

export const DcaApp = createComponent({
  tagName: "gc-dca-app",
  elementClass: Apps.DcaApp,
  react: React,
  events: {
    onDcaSchedule: "gc:tx:scheduleDca" as EventName<CustomEvent<TxInfo>>,
    onDcaTerminate: "gc:tx:terminateDca" as EventName<CustomEvent<TxInfo>>,
  },
})

const indexerUrl = import.meta.env.VITE_INDEXER_URL
const grafanaUrl = import.meta.env.VITE_GRAFANA_URL
const grafanaDsn = import.meta.env.VITE_GRAFANA_DSN
const stableCoinAssetId = import.meta.env.VITE_STABLECOIN_ASSET_ID

export function DcaPage() {
  const { api, isLoaded } = useRpcProvider()
  const { account } = useAccount()
  const { createTransaction } = useStore()
  const {
    isSuccess,
    isLoading,
    data: accountCurrencyId,
  } = useAccountCurrency(isLoaded ? account?.address : "")
  const { stableCoinId } = useDisplayAssetStore()

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

  const assetInDefault =
    isEvmAccount(account?.address) && isSuccess ? accountCurrencyId : undefined

  const assetOutDefault =
    isEvmAccount(account?.address) && isSuccess ? NATIVE_ASSET_ID : undefined

  return (
    <SContainer>
      <DcaApp
        ref={(r) => {
          r && r.setAttribute("chart", "")
        }}
        apiAddress={rpcUrl}
        assetIn={!isLoading ? assetInDefault : ""}
        assetOut={!isLoading ? assetOutDefault : ""}
        stableCoinAssetId={stableCoinId ?? stableCoinAssetId}
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
