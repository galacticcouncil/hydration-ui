import { flexRender } from "@tanstack/react-table"
import {
  Table,
  TableBodyContent,
  TableContainer,
  TableData,
  TableHeader,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { Fragment, useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Bond, useActiveBondsTable } from "./BondsTable.utils"
import { Transactions } from "./transactions/Transactions"
import { Heading } from "components/Typography/Heading/Heading"

type Props = {
  title: string
  data: Bond[]
  showTransactions?: boolean
}

export const BondsTable = ({ title, data, showTransactions }: Props) => {
  const [, setRow] = useState<Bond | undefined>(undefined)

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const table = useActiveBondsTable(data, { showTransactions })

  return (
    <TableContainer>
      <TableTitle>
        <Heading fs={16} fw={500} color="white">
          {title}
        </Heading>
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
              <TableRow
                isOdd={!(i % 2)}
                onClick={() => {
                  isDesktop && row.toggleSelected()
                  !isDesktop && setRow(row.original)
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableData key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableData>
                ))}
              </TableRow>
              {row.getIsSelected() && showTransactions && (
                <TableRow isSub={true}>
                  <td colSpan={table.getAllColumns().length}>
                    <Transactions />
                  </td>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBodyContent>
      </Table>
    </TableContainer>
  )
}
