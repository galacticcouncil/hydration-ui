import { MoneyMarketEventsQuery } from "graphql/__generated__/squid/graphql"
import {
  LendingTransactionRow,
  MoneyMarketEventWithDate,
} from "sections/lending/subsections/transactions/LendingTransactionsTable.columns"

export const mapMoneyMarketEvents = (
  data: MoneyMarketEventsQuery | undefined,
): Array<LendingTransactionRow> => {
  const events =
    data?.moneyMarketEvents?.nodes
      .filter((event) => !!event)
      .map<MoneyMarketEventWithDate>((event) => ({
        ...event,
        date: new Date(event.event?.block?.timestamp ?? 0),
      })) ?? []

  return Array.from(
    Map.groupBy(events, (event) => event.date).entries(),
  ).flatMap<LendingTransactionRow>(([date, events]) => [date, ...events])
}
