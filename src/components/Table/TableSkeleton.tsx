import { flexRender, Table as ReactTable } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
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
import { Fragment, ReactNode } from "react"

type Props = {
  table: ReactTable<unknown>
  title: string
  placeholder?: ReactNode
  className?: string
  hideHeader?: boolean
}

export const TableSkeleton = ({
  table,
  title,
  placeholder,
  className,
  hideHeader = false,
}: Props) => {
  return (
    <TableContainer className={className}>
      <TableTitle>
        <Text
          fs={[15, 19]}
          lh={[19.5, 24.7]}
          css={{ fontFamily: "FontOver" }}
          fw={500}
          color="white"
        >
          {title}
        </Text>
      </TableTitle>
      <div css={{ position: "relative" }}>
        {placeholder && (
          <TablePlaceholderContent>{placeholder}</TablePlaceholderContent>
        )}
        <Table>
          {!hideHeader && (
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
          )}
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
