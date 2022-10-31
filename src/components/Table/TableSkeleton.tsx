import {
  STable,
  STableBodyContent,
  STableContainer,
  STableData,
  STableHeaderContent,
  STablePlaceholderContent,
  STableRow,
  STableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { flexRender, Table } from "@tanstack/react-table"
import { Fragment, ReactNode } from "react"
import { TableHeader } from "components/Table/Table"

type Props = { table: Table<unknown>; title: string; placeholder?: ReactNode }

export const TableSkeleton = ({ table, title, placeholder }: Props) => {
  return (
    <STableContainer>
      <STableTitle>
        <Text fs={20} lh={26} fw={500} color="white">
          {title}
        </Text>
      </STableTitle>
      <STable>
        <STableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <STableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHeader key={header.id} canSort={false}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHeader>
              ))}
            </STableRow>
          ))}
        </STableHeaderContent>
        <STableBodyContent>
          {placeholder && (
            <STablePlaceholderContent>{placeholder}</STablePlaceholderContent>
          )}
          {table.getRowModel().rows.map((row, i) => (
            <Fragment key={row.id}>
              <STableRow isOdd={!(i % 2)}>
                {row.getVisibleCells().map((cell) => (
                  <STableData key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </STableData>
                ))}
              </STableRow>
            </Fragment>
          ))}
        </STableBodyContent>
      </STable>
    </STableContainer>
  )
}
