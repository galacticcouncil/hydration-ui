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
import { ButtonTransparent } from "components/Button/Button"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import { theme } from "theme"
import { useTranslation } from "react-i18next"

export const Transactions = ({
  data,
  onHide,
}: {
  data: Transaction[]
  onHide: () => void
}) => {
  const { t } = useTranslation()
  const table = useTransactionsTable(data)

  return (
    <>
      <TableTitle>
        <Text fs={16} fw={500}>
          {t("bonds.transactions.table.pastTransactions")}
        </Text>
      </TableTitle>
      <Table>
        <TableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHeader key={header.id} css={{ textAlign: "center" }}>
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
              <TableRow>
                {row.getVisibleCells().map((cell) => (
                  <STableData key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </STableData>
                ))}
              </TableRow>
            </Fragment>
          ))}
        </TableBodyContent>
      </Table>
      <div
        sx={{ flex: "row", align: "center", justify: "center", py: 10 }}
        onClick={onHide}
        css={{
          cursor: "pointer",
          "&:hover > p": { color: theme.colors.white },
        }}
      >
        <Text fs={14} fw={500} color="basic400">
          {t("bonds.transactions.table.hide")}
        </Text>
        <ButtonTransparent
          css={{
            color: theme.colors.basic400,
            transform: "rotate(180deg)",
          }}
        >
          <ChevronDownIcon />
        </ButtonTransparent>
      </div>
    </>
  )
}
