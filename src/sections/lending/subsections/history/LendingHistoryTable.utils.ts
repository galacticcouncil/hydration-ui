import { MoneyMarketEventsQuery } from "graphql/__generated__/squid/graphql"
import {
  LendingHistoryRow,
  MoneyMarketEventWithDate,
} from "sections/lending/subsections/history/LendingHistoryTable.columns"

export const mapMoneyMarketEvents = (
  data: MoneyMarketEventsQuery | undefined,
): Array<LendingHistoryRow> => {
  const events =
    data?.moneyMarketEvents?.nodes
      .filter((event) => !!event)
      .map<MoneyMarketEventWithDate>((event) => ({
        ...event,
        date: new Date(event.event?.block?.timestamp ?? 0),
      })) ?? []

  return Array.from(
    Map.groupBy(
      events,
      (event) => event.date.toISOString().split("T")[0],
    ).entries(),
  ).flatMap<LendingHistoryRow>(([date, events]) => [new Date(date), ...events])
}
