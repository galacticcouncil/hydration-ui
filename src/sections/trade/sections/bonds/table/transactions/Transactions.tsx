import { Transaction, useTransactionsTable } from "./Transactions.utils"
import {
  Table,
  TableBodyContent,
  TableHeader,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { flexRender } from "@tanstack/react-table"
import { Fragment } from "react"
import { Text } from "components/Typography/Text/Text"
import { STableData } from "./Transactions.styled"

const mockedTransactionData: Transaction[] = [
  {
    id: "1",
    date: "25.12.2023",
    price: "2855.24",
    in: {
      assetId: "0",
      symbol: "HDX",
      amount: "2855.24",
    },
    out: {
      assetId: "2",
      symbol: "DAI",
      amount: "2855.24",
    },
    link: "",
  },
]

export const Transactions = () => {
  const table = useTransactionsTable(mockedTransactionData)

  return (
    <>
      <TableTitle>
        <Text fs={16} fw={500}>
          Past transactions
        </Text>
      </TableTitle>
      <Table>
        <TableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHeader key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHeader>
              ))}
            </TableRow>
          ))}
        </TableHeaderContent>
        <TableBodyContent>
          {table.getRowModel().rows.map((row, i) => (
            <Fragment key={row.id}>
              <TableRow isOdd={!(i % 2)}>
                {row.getVisibleCells().map((cell) => (
                  <STableData key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </STableData>
                ))}
              </TableRow>
              {row.getIsSelected() && (
                <TableRow isSub={true}>
                  <STableData colSpan={table.getAllColumns().length}>
                    <Transactions />
                  </STableData>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBodyContent>
      </Table>
    </>
  )
}
