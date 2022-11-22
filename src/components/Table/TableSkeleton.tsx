import {
  Table,
  TableBodyContent,
  TableContainer,
  TableData,
  TableHeaderContent,
  TablePlaceholderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { flexRender, Table as ReactTable } from "@tanstack/react-table"
import { Fragment, ReactNode } from "react"
import { TableSortHeader } from "components/Table/Table"

type Props = {
  table: ReactTable<unknown>
  title: string
  placeholder?: ReactNode
  className?: string
}

export const TableSkeleton = ({
  table,
  title,
  placeholder,
  className,
}: Props) => {
  return (
    <TableContainer className={className}>
      <TableTitle>
        <Text fs={[16, 20]} lh={[20, 26]} fw={500} color="white">
          {title}
        </Text>
      </TableTitle>
      <div css={{ position: "relative" }}>
        {placeholder && (
          <TablePlaceholderContent>{placeholder}</TablePlaceholderContent>
        )}
        <Table>
          <TableHeaderContent>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableSortHeader key={header.id} canSort={false}>
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
            {table.getRowModel().rows.map((row, i) => (
              <Fragment key={row.id}>
                <TableRow isOdd={!(i % 2)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableData key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableData>
                  ))}
                </TableRow>
              </Fragment>
            ))}
          </TableBodyContent>
        </Table>
      </div>
    </TableContainer>
  )
}
