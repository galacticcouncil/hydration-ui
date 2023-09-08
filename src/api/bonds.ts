// @ts-nocheck
import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { useIndexerUrl } from "./provider"
import { Maybe } from "utils/helpers"
import request, { gql } from "graphql-request"

export type Bond = {
  assetId: string
  id: string
  name: string
  maturity: number
}

export const useBonds = (params?: { id?: string; disable?: boolean }) => {
  const api = useApiPromise()
  const { id, disable } = params ?? {}

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
            //name: data.name.toString(),
            assetId: assetId?.toString(),
            maturity: maturity?.toNumber(),
          })
        }

        return prevAcc
      }, Promise.resolve([]))
    },
    {
      enabled: !disable,
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

export const useLbpPool = (params?: { id?: string }) => {
  const api = useApiPromise()

  const { id } = params ?? {}

  return useQuery(
    QUERY_KEYS.lbpPool,
    async () => {
      const raw = await api.query.lbp.poolData.entries()

      const data = raw.map(([key, rawData]) => {
        const data = rawData.unwrap()

        return {
          id: key.toHuman()[0],
          owner: data.owner.toString(),
          start: Number(data.start.toString()),
          end: Number(data.end.toString()),
          assets: data.assets.map((asset) => asset.toNumber()),
          initialWeight: data.initialWeight.toNumber(),
          finalWeight: data.finalWeight.toNumber(),
          weightCurve: data.weightCurve.toString(),
          fee: data.fee.map((el) => el.toNumber()),
          feeCollector: data.feeCollector.toString(),
          repayTarget: data.repayTarget.toString(),
        }
      })

      return data
    },
    {
      enabled: !(params && !id),
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
  const indexerUrl = useIndexerUrl()
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

export const useLBPPoolEvents = (bondId: Maybe<string>) => {
  const indexerUrl = useIndexerUrl()

  return useQuery(
    QUERY_KEYS.lbpPoolTotal(bondId),
    getLbpPoolBalance(indexerUrl, bondId),
    { enabled: !!bondId },
  )
}

export const isPoolUpdateEvent = (
  event: LBPPoolEvents,
): event is LBPPoolUpdate => event.name === "LBP.PoolUpdated"

export const isPoolLiquidityEvent = (
  event: LBPPoolEvents,
): event is LBPPoolLiquidityEvent => event.name !== "LBP.PoolUpdated"

type LBPPoolLiquidityEvent = {
  args: {
    assetA: string
    assetB: string
    amountA: string
    amountB: string
    who: string
  }
  name: "LBP.LiquidityAdded" | "LBP.LiquidityRemoved"
}

type LBPPoolUpdate = {
  name: "LBP.PoolUpdated"
  args: { data: NonNullable<ReturnType<typeof useLbpPool>["data"]>[0] }
}

type LBPPoolEvents = LBPPoolLiquidityEvent | LBPPoolUpdate

const getLbpPoolBalance = (indexerUrl: string, bondId?: string) => async () => {
  return {
    ...(await request<{
      events: Array<LBPPoolEvents>
    }>(
      indexerUrl,
      gql`
        query LBPLiquidityAdded($bondId: Int) {
          events(
            where: {
              name_eq: "LBP.LiquidityAdded"
              args_jsonContains: { assetB: $bondId }
              OR: {
                args_jsonContains: { assetB: $bondId }
                name_contains: "LBP.LiquidityRemoved"
                OR: {
                  name_contains: "LBP.PoolUpdated"
                  args_jsonContains: { data: { assets: [$bondId] } }
                }
              }
            }
            orderBy: [block_height_ASC]
          ) {
            args
            name
          }
        }
      `,
      { bondId: Number(bondId) },
    )),
  }
}
