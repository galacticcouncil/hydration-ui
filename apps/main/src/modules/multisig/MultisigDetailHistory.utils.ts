import {
  MultisigDetailHistoryRow,
  MultisigDetailHistoryTableRow,
} from "@/modules/multisig/MultisigDetailHistory.columns"

export const groupMultisigHistoryByDate = (
  rows: ReadonlyArray<MultisigDetailHistoryRow>,
): MultisigDetailHistoryTableRow[] => {
  return Array.from(
    Map.groupBy(rows, (row) => {
      if (!row.timestamp) return

      const date = new Date(row.timestamp)

      /* remove timezone offset to get date time in user's timezone that acts as UTC so it can be grouped by it*/
      return new Date(date.valueOf() - date.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split("T")[0]
    })
      .entries()
      .flatMap<MultisigDetailHistoryTableRow>(([date, dayRows]) => {
        if (!date) {
          return dayRows
        }

        const dateOnly = new Date(date)
        // add timezone offset back to preserve the original date in UTC, otherwise the date might shift due to timezone
        const dt = new Date(
          dateOnly.valueOf() + dateOnly.getTimezoneOffset() * 60 * 1000,
        )

        return [dt, ...dayRows]
      }),
  )
}
