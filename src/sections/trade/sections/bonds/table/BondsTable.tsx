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
import { BondTableItem, useActiveBondsTable } from "./BondsTable.utils"
import { Transactions } from "./transactions/Transactions"
import { Text } from "components/Typography/Text/Text"

type Props = {
  title: string
  data: BondTableItem[]
  showTransactions?: boolean
  showTransfer?: boolean
}

export const BondsTable = ({
  title,
  data,
  showTransactions,
  showTransfer,
}: Props) => {
  const [, setRow] = useState<BondTableItem | undefined>(undefined)

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const table = useActiveBondsTable(data, {
    showTransactions,
    showTransfer,
  })

  return (
    <TableContainer
      css={{ backgroundColor: `rgba(${theme.rgbColors.bg}, 0.4)` }}
    >
      <TableTitle>
        <Text
          fs={[16, 20]}
          lh={[20, 26]}
          css={{ fontFamily: "FontOver" }}
          fw={500}
          color="white"
        >
          {title}
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
