import { queryOptions } from "@tanstack/react-query"

import {
  NECKWORK_ACCOUNT_KEY,
  NECKWORK_BASE_STALE_TIME,
  NeckworkClient,
  NeckworkResponse,
} from "."

type MoneyMarketEventsResponse =
  NeckworkResponse<"/v1/accounts/{account}/money-market-events">

export type NeckworkMoneyMarketEvent =
  MoneyMarketEventsResponse["items"][number]

export type MoneyMarketEventName = NeckworkMoneyMarketEvent["eventName"]

export const moneyMarketEventsQuery = (
  client: NeckworkClient,
  account: string,
  events: string[],
  search: string,
  limit: number,
  offset: number,
) =>
  queryOptions({
    queryKey: [
      ...NECKWORK_ACCOUNT_KEY,
      "moneyMarketEvents",
      account,
      events,
      search,
      limit,
      offset,
    ],
    staleTime: NECKWORK_BASE_STALE_TIME,
    enabled: !!account,
    queryFn: async (): Promise<MoneyMarketEventsResponse> => {
      const { data } = await client.GET(
        "/v1/accounts/{account}/money-market-events",
        {
          params: {
            path: { account },
            query: {
              limit,
              offset,
              ...(events.length ? { events: events.join(",") } : {}),
              ...(search ? { search } : {}),
            },
          },
        },
      )

      if (!data) throw new Error("Neckwork API returned no money-market events")

      return data
    },
  })
