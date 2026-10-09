import { queryOptions } from "@tanstack/react-query"

import { NECKWORK_BASE_STALE_TIME, NeckworkClient, NeckworkResponse } from "."

export type StakingEvent =
  NeckworkResponse<"/v1/staking/events">["items"][number]

export type StakingEventType = StakingEvent["type"]

type StakingEventsArgs = {
  types: readonly StakingEventType[]
  fromBlock?: number
  limit?: number
}

export const stakingEventsQuery = (
  client: NeckworkClient,
  { types, fromBlock, limit }: StakingEventsArgs,
) =>
  queryOptions({
    queryKey: ["neckwork", "staking", "events", types, fromBlock, limit],
    staleTime: NECKWORK_BASE_STALE_TIME,
    queryFn: async (): Promise<readonly StakingEvent[]> => {
      const { data } = await client.GET("/v1/staking/events", {
        params: { query: { types: types.join(","), fromBlock, limit } },
      })

      if (!data) throw new Error("Neckwork API returned no staking events")

      return data.items
    },
  })
