import { flexRender } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
import {
  TableContainer,
  Table,
  TableBodyContent,
  TableData,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { useTransactionsTable } from "./TransactionsTable.utils"
import {
  TTransactionRow,
  TTransactionsTableData,
} from "./data/TransactionsTableData.utils"
import { useTranslation } from "react-i18next"
import { getSubscanLinkByType } from "utils/formatting"
import { Fragment, useRef, useState } from "react"
import { isSameDay, startOfDay } from "date-fns"
import { TransactionsTypeFilter } from "sections/wallet/transactions/filter/TransactionsTypeFilter"
import { TransactionsDownload } from "sections/wallet/transactions/download/TransactionsDownload"
import { Button } from "components/Button/Button"
import { useMedia } from "react-use"
import { theme } from "theme"
import { TransactionsTableActionsMob } from "sections/wallet/transactions/table/actions/TransactionsTableActionsMob"
import { NoResults } from "components/NoResults/NoResults"

type Props = {
  data: TTransactionsTableData
  filteredData: TTransactionsTableData
  hasNextPage: boolean
  setNextPage: () => void
}

export const TransactionsTable = ({
  data,
  filteredData,
  hasNextPage,
  setNextPage,
}: Props) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const lastDateRef = useRef<Date | null>(null)

  const table = useTransactionsTable(filteredData)

  const openSubscanLink = (hash: string) => {
    window.open(`${getSubscanLinkByType("extrinsic")}/${hash}`, "_blank")
  }

  const [row, setRow] = useState<TTransactionRow | undefined>(undefined)

  return (
    <TableContainer sx={{ bg: "darkBlue700" }}>
      <TableTitle css={{ border: 0 }} sx={{ px: 16, py: 26 }}>
        <Text
          fs={[15, 20]}
          lh={[20, 26]}
          css={{ fontFamily: "FontOver" }}
          fw={500}
          color="white"
        >
          {t("wallet.transactions.table.header.title")}
        </Text>
        <TransactionsDownload data={data} />
      </TableTitle>
      <TransactionsTypeFilter />
      {filteredData.length ? (
        <Table>
          <TableHeaderContent>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} header>
                {hg.headers.map((header) => (
                  <TableSortHeader
                    key={header.id}
                    canSort={header.column.getCanSort()}
                    sortDirection={header.column.getIsSorted()}
                    onSort={header.column.getToggleSortingHandler()}
                    css={{
                      "&": {
                        fontWeight: 500,
                        paddingTop: 14,
                        paddingBottom: 14,
                      },
                      "&:nth-of-type(3) > div": {
                        justifyContent: "end",
                      },
                      "&:nth-of-type(4) > div": {
                        justifyContent: "center",
                      },
                      "&:nth-of-type(6) > div": {
                        justifyContent: "center",
                      },
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableSortHeader>
                ))}
              </TableRow>
            ))}
          </TableHeaderContent>
          <TableBodyContent>
            {table.getRowModel().rows.map((row, index) => {
              const date = startOfDay(new Date(row.original.date))

              const isFirst = index === 0
              const isRepeatDay = isSameDay(lastDateRef.current ?? 0, date)
              if (!isRepeatDay) {
                lastDateRef.current = date
              }

              const shouldRenderDateRow = isFirst || !isRepeatDay

              return (
                <Fragment key={row.id}>
                  {shouldRenderDateRow && (
                    <TableRow>
                      <TableData
                        css={{
                          "&": {
                            paddingTop: 16,
                            paddingBottom: 8,
                            pointerEvents: "none",
                          },
                        }}
                        colSpan={table.getAllColumns().length}
                      >
                        <Text fs={12} color="darkBlue200">
                          {t("stats.overview.chart.tvl.label.date", {
                            date,
                          })}
                        </Text>
                      </TableData>
                    </TableRow>
                  )}
                  <TableRow css={{ cursor: "pointer" }}>
                    {row.getVisibleCells().map((cell) => (
                      <TableData
                        key={cell.id}
                        css={{
                          "&": {
                            paddingTop: 14,
                            paddingBottom: 14,
                          },
                          "&:last-of-type": {
                            paddingLeft: 0,
                          },
                          "&:nth-of-type(5)": {
                            width: 20,
                            paddingLeft: 0,
                            paddingRight: 0,
                          },
                        }}
                        onClick={() =>
                          isDesktop
                            ? openSubscanLink(row.original.extrinsicHash)
                            : setRow(row.original)
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableData>
                    ))}
                  </TableRow>
                </Fragment>
              )
            })}
          </TableBodyContent>
        </Table>
      ) : (
        <NoResults
          css={{ borderTop: "1px solid rgba(32, 33, 53, 1)" }}
          sx={{ py: [50, 70] }}
        />
      )}

      {!isDesktop && !!row && (
        <TransactionsTableActionsMob
          row={row}
          onClose={() => setRow(undefined)}
          onSubscanClick={openSubscanLink}
        />
      )}
      {hasNextPage && (
        <div
          sx={{ textAlign: "center", py: 16 }}
          css={{ borderTop: "1px solid rgba(32, 33, 53, 1)" }}
        >
          <Button
            variant="outline"
            size="micro"
            onClick={setNextPage}
            transform="none"
            sx={{
              py: [10, 6],
              width: ["90%", "auto"],
            }}
          >
            {t("wallet.transactions.table.more")}
          </Button>
        </div>
      )}
    </TableContainer>
  )
}
