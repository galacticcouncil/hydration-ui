import { flexRender, Table as ReactTable } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
import {
  StatsTableContainer,
  StatsTableTitle,
  Table,
  TableBodyContent,
  TableContainer,
  TableData,
  TableHeaderContent,
  TablePlaceholderContent,
  TableRow,
  TableRowStats,
  TableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { Fragment, ReactNode } from "react"

type Props = {
  table: ReactTable<unknown>
  title?: string
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
      {title && (
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
      )}
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

export const TableStatsSkeleton = ({
  table,
  title,
  placeholder,
  className,
  hideHeader = false,
}: Props) => {
  return (
    <StatsTableContainer className={className}>
      {title && (
        <StatsTableTitle>
          <Text
            fs={[16, 24]}
            lh={[24, 26]}
            color="white"
            font="ChakraPetchBold"
          >
            {title}
          </Text>
        </StatsTableTitle>
      )}
      <div css={{ position: "relative" }}>
        {placeholder && (
          <TablePlaceholderContent>{placeholder}</TablePlaceholderContent>
        )}
        <Table>
          {!hideHeader && (
            <TableHeaderContent>
              {table.getHeaderGroups().map((hg) => (
                <TableRowStats key={hg.id} header>
                  {hg.headers.map((header) => (
                    <TableSortHeader key={header.id} canSort={false}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableSortHeader>
                  ))}
                </TableRowStats>
              ))}
            </TableHeaderContent>
          )}
          <TableBodyContent>
            {table.getRowModel().rows.map((row, i) => (
              <Fragment key={row.id}>
                <TableRowStats isOdd={!(i % 2)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableData key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableData>
                  ))}
                </TableRowStats>
              </Fragment>
            ))}
          </TableBodyContent>
        </Table>
      </div>
    </StatsTableContainer>
  )
}
