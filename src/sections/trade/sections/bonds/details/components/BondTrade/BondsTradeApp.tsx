import { SContainer } from "./BondsTradeApp.styled"

import type { TxInfo } from "@galacticcouncil/apps"

import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent, EventName } from "@lit-labs/react"
import { useAccountStore, useStore } from "state/store"
import { z } from "zod"
import { MakeGenerics, useSearch } from "@tanstack/react-location"
import { useProviderRpcUrlStore } from "api/provider"
import { PoolType } from "@galacticcouncil/sdk"
import { useRpcProvider } from "providers/rpcProvider"

export const BondsApp = createComponent({
  tagName: "gc-bonds-app",
  elementClass: Apps.BondsApp,
  react: React,
  events: {
    onTxNew: "gc:tx:new" as EventName<CustomEvent<TxInfo>>,
    onQueryUpdate: "gc:query:update" as EventName<CustomEvent>,
  },
})

const BondsAppSearch = z.object({
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
  Search: z.infer<typeof BondsAppSearch>
}>

const squidUrl = import.meta.env.VITE_SQUID_URL
const stableCoinAssetId = import.meta.env.VITE_STABLECOIN_ASSET_ID

export const BondsTrade = ({
  bondId,
  setBondId,
}: {
  bondId?: string
  setBondId: (bondId: string) => void
}) => {
  const { api, assets } = useRpcProvider()
  const { account } = useAccountStore()
  const { createTransaction } = useStore()

  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL

  const rawSearch = useSearch<SearchGenerics>()
  const search = BondsAppSearch.safeParse(rawSearch)

  const handleQueryUpdate = async (e: CustomEvent) => {
    const assetIn = e.detail.assetIn.toString() as string
    const assetOut = e.detail.assetOut.toString() as string

    const bond = assets.getAssets([assetIn, assetOut]).find(assets.isBond)

    if (bond && bondId !== bond.id) {
      setBondId(bond.id)
    }
  }

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
      <BondsApp
        ref={(r) => {
          if (r) {
            r.setAttribute("chart", "")
          }
        }}
        assetIn={search.success ? search.data.assetIn : undefined}
        assetOut={search.success ? search.data.assetOut : undefined}
        apiAddress={rpcUrl}
        pools={[PoolType.Omni, PoolType.LBP].join(",")}
        stableCoinAssetId={stableCoinAssetId}
        accountName={account?.name}
        accountProvider={account?.provider}
        accountAddress={account?.address}
        squidUrl={squidUrl}
        onTxNew={(e) => handleSubmit(e)}
        onQueryUpdate={(e) => handleQueryUpdate(e)}
      />
    </SContainer>
  )
}
