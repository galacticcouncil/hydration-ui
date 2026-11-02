import { queryOptions } from "@tanstack/react-query"

import { isNeckworkNotFound, NeckworkClient, NeckworkResponse } from "."

export type Extrinsic = NeckworkResponse<"/v1/extrinsics/{hash}">

export const extrinsicByHashQuery = (client: NeckworkClient, hash: string) =>
  queryOptions({
    queryKey: ["neckwork", "extrinsic", hash],
    enabled: !!hash,
    queryFn: async (): Promise<Extrinsic | null> => {
      try {
        const { data } = await client.GET("/v1/extrinsics/{hash}", {
          params: { path: { hash } },
        })

        if (!data) throw new Error("Neckwork API returned no extrinsic")

        return data
      } catch (error) {
        if (isNeckworkNotFound(error)) return null
        throw error
      }
    },
  })

export const extrinsicByBlockAndIndexQuery = (
  client: NeckworkClient,
  blockHeight: number,
  index: number,
) =>
  queryOptions({
    queryKey: ["neckwork", "extrinsic", blockHeight, index],
    queryFn: async (): Promise<Extrinsic | null> => {
      try {
        const { data } = await client.GET(
          "/v1/extrinsics/{blockHeight}/{index}",
          { params: { path: { blockHeight, index } } },
        )

        if (!data) throw new Error("Neckwork API returned no extrinsic")

        return data
      } catch (error) {
        if (isNeckworkNotFound(error)) return null
        throw error
      }
    },
  })
