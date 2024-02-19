import { SContainer } from "./YieldDcaPage.styled"

import type { TxInfo } from "@galacticcouncil/apps"

import * as React from "react"
import { Trans, useTranslation } from "react-i18next"
import * as Apps from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"
import { useStore } from "state/store"
import { useProviderRpcUrlStore } from "api/provider"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useDisplayAssetStore } from "utils/displayAsset"

export const DcaYieldApp = createComponent({
  tagName: "gc-yield",
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

export function YieldDcaPage() {
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { createTransaction } = useStore()
  const { t } = useTranslation()
  const { stableCoinId } = useDisplayAssetStore()

  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL

  const handleSubmit = async (e: CustomEvent<TxInfo>) => {
    const { transaction, meta } = e.detail
    const { amountInFrom, assetIn } = meta ?? {}
    await createTransaction(
      {
        tx: api.tx(transaction.hex),
      },
      {
        onSuccess: () => {},
        onSubmitted: () => {},
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="yield.toast.onLoading"
              tOptions={{
                amount: amountInFrom,
                symbol: assetIn,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="yield.toast.onSuccess"
              tOptions={{
                amount: amountInFrom,
                symbol: assetIn,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
        },
      },
    )
  }

  return (
    <SContainer>
      <DcaYieldApp
        ref={(r) => {
          r && r.setAttribute("chart", "")
        }}
        apiAddress={rpcUrl}
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
