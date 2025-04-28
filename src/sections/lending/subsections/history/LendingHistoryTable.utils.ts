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
      (event) =>
        /* remove timezone offset to get date time in user's timezone that acts as UTC so it can be grouped by it*/
        new Date(
          event.date.valueOf() - event.date.getTimezoneOffset() * 60 * 1000,
        )
          .toISOString()
          .split("T")[0],
    ).entries(),
  ).flatMap<LendingHistoryRow>(([date, events]) => {
    const dateOnly = new Date(date)
    // add timezone offset back to preserve the original date in UTC, otherwise the date might shift due to timezone
    const dt = new Date(
      dateOnly.valueOf() + dateOnly.getTimezoneOffset() * 60 * 1000,
    )

    return [dt, ...events]
  })
}
