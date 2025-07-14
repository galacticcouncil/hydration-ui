import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import request from "graphql-request"

import { MoneyMarketEventsDocument } from "@/codegen/__generated__/squid/graphql"
import {
  borrowHistoryFilters,
  BorrowHistoryFilterType,
} from "@/modules/borrow/history/BorrowHistoryFilter.utils"
import { EventName } from "@/modules/borrow/history/types"

export const useMoneyMarketEvents = (
  filter: ReadonlyArray<BorrowHistoryFilterType> | undefined,
  searchPhrase: string,
  pagination: PaginationState,
) => {
  const { account } = useAccount()
  const address = account?.publicKey ?? ""

  const eventNames = (filter ?? borrowHistoryFilters).flatMap(
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
          allInvolvedParticipants: { contains: [address] },
          ...(eventNames.length && { eventName: { in: eventNames } }),
          ...(searchPhrase.length && {
            allInvolvedAssetDetails: { includesInsensitive: searchPhrase },
          }),
        },
      }),
    enabled: !!address,
  })
}

const mapFilterToEventName = (
  type: BorrowHistoryFilterType,
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
