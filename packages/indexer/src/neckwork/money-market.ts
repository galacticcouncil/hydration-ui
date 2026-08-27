import { queryOptions } from "@tanstack/react-query"

import { NECKWORK_ACCOUNT_KEY, NECKWORK_STALE_TIME, NeckworkClient } from "."

export type MoneyMarketEventName =
  | "Supply"
  | "Withdraw"
  | "Borrow"
  | "Repay"
  | "LiquidationCall"
  | "ReserveUsedAsCollateralEnabled"
  | "ReserveUsedAsCollateralDisabled"
  | "UserEModeSet"

export type NeckworkMoneyMarketEvent = {
  amount: string | null
  assetId: string | null
  blockHeight: number
  categoryId: number | null
  eventIndex: number
  eventName: MoneyMarketEventName
  /** ISO 8601 */
  timestamp: string
}

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
    staleTime: NECKWORK_STALE_TIME,
    enabled: !!account,
    queryFn: async (): Promise<{
      items: readonly NeckworkMoneyMarketEvent[]
      totalCount: number
    }> => {
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

      return {
        items: Array.from(data.items),
        totalCount: data.totalCount,
      }
    },
  })
