import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import request from "graphql-request"

import { MoneyMarketEventsDocument } from "@/codegen/__generated__/squid/graphql"
import {
  lendingHistoryFilters,
  LendingHistoryFilterType,
} from "@/modules/borrow/history/LendingHistoryFilter.utils"
import { EventName } from "@/modules/borrow/history/types"

export const useMoneyMarketEvents = (
  filter: ReadonlyArray<LendingHistoryFilterType> | undefined,
  searchPhrase: string,
  pagination: PaginationState,
) => {
  const { account } = useAccount()
  const address = account?.publicKey ?? ""

  const eventNames = (filter ?? lendingHistoryFilters).flatMap(
    mapFilterToEventName,
  )

  const squidUrl = import.meta.env.VITE_SQUID_URL

  return useQuery({
    queryKey: [
      "accountMoneyMarketEvents",
      address,
      eventNames,
      searchPhrase,
      pagination,
    ],
    placeholderData: keepPreviousData,
    queryFn: () =>
      request(squidUrl, MoneyMarketEventsDocument, {
        first: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        filter: {
          allInvolvedParticipants: {
            contains: [address],
          },
          eventName: eventNames.length
            ? {
                in: eventNames,
              }
            : undefined,
          allInvolvedAssetDetails: searchPhrase.length
            ? {
                includesInsensitive: searchPhrase,
              }
            : undefined,
        },
      }),
    enabled: !!address,
  })
}

const mapFilterToEventName = (
  type: LendingHistoryFilterType,
): Array<EventName> => {
  switch (type) {
    case "borrow":
      return ["Borrow"]
    case "repay":
      return ["Repay"]
    case "supply":
      return ["Supply"]
    case "withdraw":
      return ["Withdraw"]
    case "collateral":
      return [
        "ReserveUsedAsCollateralEnabled",
        "ReserveUsedAsCollateralDisabled",
      ]
    case "liquidation":
      return ["LiquidationCall"]
    case "emode":
      return ["UserEModeSet"]
    default:
      return []
  }
}
