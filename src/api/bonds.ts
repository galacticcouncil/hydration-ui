// @ts-nocheck
import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { PROVIDERS, useProviderRpcUrlStore } from "./provider"
import { Maybe } from "utils/helpers"
import request, { gql } from "graphql-request"

export type Bond = {
  assetId: string
  id: string
  name: string
  maturity: number
}

export const useBonds = (id?: string) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.bonds,
    async () => {
      const raw = await api.query.assetRegistry.assets.entries()

      return raw.reduce<Promise<Bond[]>>(async (acc, [key, dataRaw]) => {
        const prevAcc = await acc
        const data = dataRaw.unwrap()

        if (data.assetType.isBond) {
          const id = key.args[0].toString()

          const detailsRaw = await api.query.bonds.bonds(id)
          const details = detailsRaw.unwrap()

          const [assetId, maturity] = details ?? []

          prevAcc.push({
            id,
            name: data.name.toString(),
            assetId: assetId?.toString(),
            maturity: maturity?.toNumber(),
          })
        }

        return prevAcc
      }, Promise.resolve([]))
    },
    {
      select: (bonds) => {
        if (id) {
          const bond = bonds.find((bond) => bond.id === id)

          return bond ? [bond] : undefined
        }

        return bonds
      },
    },
  )
}

export const useLbpPool = (id?: string) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.lbpPool,
    async () => {
      const raw = await api.query.lbp.poolData.entries()

      const data = raw.map(([key, rawData]) => {
        const data = rawData.unwrap()

        return {
          id: key.toHuman()[0] as string,
          owner: data.owner.toString() as string,
          start: data.start.toString() as string,
          end: data.end.toString() as string,
          assets: data.assets.map((asset) => asset.toString()) as string[],
          initialWeight: data.initialWeight.toString() as string,
          finalWeight: data.finalWeight.toString() as string,
          weightCurve: data.weightCurve.toString() as string,
          fee: data.fee.map((el) => el.toString()) as string[],
          feeCollector: data.feeCollector.toString() as string,
          repayTarget: data.repayTarget.toString() as string,
        }
      })

      return data
    },
    {
      select: (pools) => {
        if (id) {
          const pool = pools.find((pool) =>
            pool.assets.some((asset) => asset === id),
          )

          return pool ? [pool] : undefined
        }

        return pools
      },
    },
  )
}

export const useBondEvents = (bondId: Maybe<string>) => {
  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const selectedProvider = PROVIDERS.find((provider) => provider.url === rpcUrl)

  const indexerUrl =
    selectedProvider?.indexerUrl ?? import.meta.env.VITE_INDEXER_URL

  return useQuery(
    QUERY_KEYS.bondEvents(bondId),
    getBondEvents(indexerUrl, bondId),
    { enabled: !!bondId },
  )
}

type BondEvent = {
  args: {
    amount: string
    assetIn: number
    assetOut: number
    buyPrice: string
    salePrice: string
    feeAmount: string
    feeAsset: number
    who: string
  }
  name: string
}

const getBondEvents =
  (indexerUrl: string, bondId: Maybe<string>) => async () => {
    //TODO: remove block filter argument, when it is tested on rococo rpc

    return {
      ...(await request<{
        events: Array<BondEvent>
      }>(
        indexerUrl,
        gql`
          query BondTrades($bondId: Int!) {
            events(
              where: {
                args_jsonContains: { assetIn: $bondId }
                block: { timestamp_gte: "2023-08-31T20:00:00.177000Z" }
                name_contains: "LBP"
                OR: {
                  args_jsonContains: { assetOut: $bondId }
                  block: { timestamp_gte: "2023-08-31T20:00:00.177000Z" }
                  name_contains: "LBP"
                }
              }
            ) {
              name
              args
              block {
                timestamp
              }
            }
          }
        `,
        { bondId: Number(bondId) },
      )),
    }
  }
