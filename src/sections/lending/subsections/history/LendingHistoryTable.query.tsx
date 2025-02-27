import request from "graphql-request"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { u8aToHex } from "@polkadot/util"
import { decodeAddress } from "@polkadot/util-crypto"
import { MoneyMarketEventsDocument } from "graphql/__generated__/squid/graphql"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import {
  LendingHistoryFilterType,
  lendingHistoryFilters,
} from "sections/lending/subsections/history/LendingHistoryFilter.utils"
import { EventName } from "sections/lending/subsections/history/types"
import { PaginationState } from "@tanstack/react-table"
import { useSquidUrl } from "api/provider"

export const useMoneyMarketEvents = (
  filter: ReadonlyArray<LendingHistoryFilterType> | undefined,
  searchPhrase: string,
  pagination: PaginationState,
) => {
  const { account } = useAccount()
  const hexAddress = !!account?.address
    ? u8aToHex(decodeAddress(account.address))
    : ""

  const eventNames = (filter ?? lendingHistoryFilters).flatMap(
    mapFilterToEventName,
  )

  const squidUrl = useSquidUrl()

  return useQuery({
    queryKey: QUERY_KEYS.accountMoneyMarketEvents(
      hexAddress,
      eventNames,
      searchPhrase,
      pagination,
    ),
    queryFn: () =>
      request(squidUrl, MoneyMarketEventsDocument, {
        first: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        filter: {
          allInvolvedParticipants: {
            contains: [hexAddress],
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
    enabled: !!hexAddress,
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
