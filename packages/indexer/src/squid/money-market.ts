import { queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "@/squid"
import { EventDataFragment } from "@/squid/__generated__/operations"

export type MoneyMarketEventName = Capitalize<keyof EventDataFragment>

export const moneyMarketQuery = (
  squidSdk: SquidSdk,
  address: string,
  eventNames: Array<MoneyMarketEventName>,
  searchPhrase: string,
  pageSize: number,
  pageIndex: number,
) =>
  queryOptions({
    queryKey: [
      "accountMoneyMarketEvents",
      address,
      eventNames,
      searchPhrase,
      pageSize,
      pageIndex,
    ],
    queryFn: () =>
      squidSdk.MoneyMarketEvents({
        first: pageSize,
        offset: pageIndex * pageSize,
        filter: {
          allInvolvedParticipants: { contains: [address] },
          ...(eventNames.length && { eventName: { in: eventNames } }),
          ...(searchPhrase.length && {
            allInvolvedAssetDetails: { includesInsensitive: searchPhrase },
          }),
        },
      }),
    enabled: !!address,
  })
