import { moneyMarketEventsQuery } from "@galacticcouncil/indexer/neckwork"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { neckworkClient } from "@/api/neckwork"
import {
  borrowHistoryFilters,
  BorrowHistoryFilterType,
} from "@/modules/borrow/history/BorrowHistoryFilter.utils"

export const moneyMarketEventNames = [
  "Supply",
  "Withdraw",
  "Borrow",
  "Repay",
  "LiquidationCall",
  "ReserveUsedAsCollateralEnabled",
  "ReserveUsedAsCollateralDisabled",
  "UserEModeSet",
] as const

export type MoneyMarketEventName = (typeof moneyMarketEventNames)[number]

export type MoneyMarketEvent = {
  readonly eventName: MoneyMarketEventName
  readonly assetId: string | null
  readonly amount: string | null
  readonly date: Date
  readonly categoryId: number | null
}

export type NeckworkMoneyMarketEvent = {
  readonly eventName: MoneyMarketEventName
  readonly assetId: string | null
  readonly amount: string | null
  readonly timestamp: string
  readonly categoryId: number | null
}

export const mapNeckworkMoneyMarketEvent = ({
  eventName,
  assetId,
  amount,
  timestamp,
  categoryId,
}: NeckworkMoneyMarketEvent): MoneyMarketEvent => ({
  eventName,
  assetId,
  amount,
  date: new Date(timestamp),
  categoryId,
})

type MoneyMarketEventPage = {
  readonly items: ReadonlyArray<MoneyMarketEvent>
  readonly totalCount: number
}

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

  const { data, isLoading, isFetching } = useQuery({
    ...moneyMarketEventsQuery(
      neckworkClient,
      address,
      eventNames,
      searchPhrase,
      pagination.pageSize,
      pagination.pageIndex * pagination.pageSize,
    ),
    enabled: !!address,
    placeholderData: keepPreviousData,
    select: (data): MoneyMarketEventPage => ({
      items: data.items.map(mapNeckworkMoneyMarketEvent),
      totalCount: data.totalCount,
    }),
  })

  return { data, isLoading, isFetching }
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
