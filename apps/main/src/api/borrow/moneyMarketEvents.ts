import { moneyMarketEventsQuery } from "@galacticcouncil/indexer/neckwork"
import {
  MoneyMarketEventFragment,
  moneyMarketQuery,
} from "@galacticcouncil/indexer/squid"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { neckworkClient, useSquidClient } from "@/api/provider"
import {
  borrowHistoryFilters,
  BorrowHistoryFilterType,
} from "@/modules/borrow/history/BorrowHistoryFilter.utils"
import { useNeckworkEnabled } from "@/states/neckwork"

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

/** Source-agnostic money-market row — Squid and Neckwork both map into this. */
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

export const mapSquidMoneyMarketEvent = (
  event: MoneyMarketEventFragment,
): MoneyMarketEvent => {
  const eventName = event.eventName as MoneyMarketEventName
  // the fragment nests one payload per event name; only one is set
  const payload =
    event.supply ??
    event.withdraw ??
    event.borrow ??
    event.repay ??
    event.reserveUsedAsCollateralEnabled ??
    event.reserveUsedAsCollateralDisabled ??
    event.liquidationCall

  return {
    eventName,
    assetId: payload?.asset?.assetRegistryId ?? null,
    amount:
      payload && "amount" in payload && payload.amount ? payload.amount : null,
    date: new Date(event.event?.block?.timestamp ?? 0),
    categoryId: event.userEModeSet?.categoryId ?? null,
  }
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

  const squidSdk = useSquidClient()
  const neckworkEnabled = useNeckworkEnabled()

  const {
    data: neckworkData,
    isLoading: isNeckworkLoading,
    isFetching: isNeckworkFetching,
  } = useQuery({
    ...moneyMarketEventsQuery(
      neckworkClient,
      address,
      eventNames,
      searchPhrase,
      pagination.pageSize,
      pagination.pageIndex * pagination.pageSize,
    ),
    enabled: neckworkEnabled && !!address,
    placeholderData: keepPreviousData,
    select: (data): MoneyMarketEventPage => ({
      items: data.items.map(mapNeckworkMoneyMarketEvent),
      totalCount: data.totalCount,
    }),
  })

  const {
    data: squidData,
    isLoading: isSquidLoading,
    isFetching: isSquidFetching,
  } = useQuery({
    ...moneyMarketQuery(
      squidSdk,
      address,
      eventNames,
      searchPhrase,
      pagination.pageSize,
      pagination.pageIndex,
    ),
    enabled: !neckworkEnabled && !!address,
    placeholderData: keepPreviousData,
    select: (data): MoneyMarketEventPage => ({
      items:
        data.moneyMarketEvents?.nodes
          .filter((event) => !!event)
          .map(mapSquidMoneyMarketEvent) ?? [],
      totalCount: data.moneyMarketEvents?.totalCount ?? 0,
    }),
  })

  return {
    data: neckworkEnabled ? neckworkData : squidData,
    isLoading: neckworkEnabled ? isNeckworkLoading : isSquidLoading,
    isFetching: neckworkEnabled ? isNeckworkFetching : isSquidFetching,
  }
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
