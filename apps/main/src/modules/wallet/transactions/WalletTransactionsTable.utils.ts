import { WalletTransactionRow } from "@/modules/wallet/transactions/WalletTransactionsTable.columns"
import { TransactionMock } from "@/modules/wallet/transactions/WalletTransactionsTable.data"

export const groupTransactionsByDate = (
  transactions: ReadonlyArray<TransactionMock>,
): Array<WalletTransactionRow> =>
  Array.from(
    Map.groupBy(transactions, (transaction) => {
      const date = new Date(transaction.timestamp)

      /* remove timezone offset to get date time in user's timezone that acts as UTC so it can be grouped by it*/
      return new Date(date.valueOf() - date.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split("T")[0]
    })
      .entries()
      .flatMap<WalletTransactionRow>(([date, transactions]) => {
        if (!date) {
          return transactions
        }

        const dateOnly = new Date(date)
        // add timezone offset back to preserve the original date in UTC, otherwise the date might shift due to timezone
        const dt = new Date(
          dateOnly.valueOf() + dateOnly.getTimezoneOffset() * 60 * 1000,
        )

        return [dt, ...transactions]
      }),
  )
