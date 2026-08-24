import { getToken } from "@galacticcouncil/ui/utils"

import { MoneyMarketEvent } from "@/api/borrow"
import { BorrowHistoryRow } from "@/modules/borrow/history/BorrowHistoryTable.columns"

export const getOnUpdatePendingStyles = (isUpdating: boolean) => ({
  opacity: isUpdating ? 0.5 : 1,
  transition: getToken("transitions.opacity"),
  transitionDelay: "0.2s",
})

export const mapMoneyMarketEvents = (
  events: ReadonlyArray<MoneyMarketEvent> | undefined,
): Array<BorrowHistoryRow> => {
  return Array.from(
    Map.groupBy(
      events ?? [],
      (event) =>
        /* remove timezone offset to get date time in user's timezone that acts as UTC so it can be grouped by it*/
        new Date(
          event.date.valueOf() - event.date.getTimezoneOffset() * 60 * 1000,
        )
          .toISOString()
          .split("T")[0],
    ).entries(),
  ).flatMap<BorrowHistoryRow>(([date, events]) => {
    const dateOnly = new Date(date || 0)
    // add timezone offset back to preserve the original date in UTC, otherwise the date might shift due to timezone
    const dt = new Date(
      dateOnly.valueOf() + dateOnly.getTimezoneOffset() * 60 * 1000,
    )

    return [dt, ...events]
  })
}
