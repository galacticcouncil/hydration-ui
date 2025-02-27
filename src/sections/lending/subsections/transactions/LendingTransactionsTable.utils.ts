import { MoneyMarketEventsQuery } from "graphql/__generated__/squid/graphql"
import { LendingTransactionRow } from "sections/lending/subsections/transactions/LendingTransactionsTable.columns"

export const mapMoneyMarketEvents = (
  data: MoneyMarketEventsQuery | undefined,
): Array<LendingTransactionRow> => {
  const events =
    data?.moneyMarketEvents?.nodes
      .filter((event) => !!event)
      .map((event) => ({
        ...event,
        _date: new Date(event.event?.block?.timestamp ?? ""),
      })) ?? []

  return Map.groupBy(events, (event) => event._date.toLocaleDateString())
    .entries()
    .flatMap<LendingTransactionRow>(([date, events]) => [
      new Date(date),
      ...events,
    ])
    .toArray()
}
