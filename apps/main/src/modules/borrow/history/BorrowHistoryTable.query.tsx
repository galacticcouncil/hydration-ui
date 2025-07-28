import {
  MoneyMarketEventName,
  moneyMarketQuery,
} from "@galacticcouncil/indexer/squid"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { useSquidClient } from "@/api/provider"
import {
  borrowHistoryFilters,
  BorrowHistoryFilterType,
} from "@/modules/borrow/history/BorrowHistoryFilter.utils"

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

  const squidSdk = useSquidClient()

  return useQuery({
    ...moneyMarketQuery(
      squidSdk,
      address,
      eventNames,
      searchPhrase,
      pagination.pageSize,
      pagination.pageIndex,
    ),
    placeholderData: keepPreviousData,
  })
}

const mapFilterToEventName = (
  type: BorrowHistoryFilterType,
): Array<MoneyMarketEventName> => {
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
