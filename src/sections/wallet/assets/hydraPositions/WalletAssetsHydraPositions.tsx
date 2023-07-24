import { useTranslation } from "react-i18next"
import { Fragment } from "react"
import {
  Table,
  TableBodyContent,
  TableContainer,
  TableData,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { TableSortHeader } from "components/Table/Table"
import { flexRender } from "@tanstack/react-table"
import {
  HydraPositionsTableData,
  useHydraPositionsTable,
} from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { EmptyState } from "./EmptyState"
import { tableStyles } from "./WalletHydraPositions.styled"

type Props = { data: HydraPositionsTableData[] }

export const WalletAssetsHydraPositions = ({ data }: Props) => {
  const { t } = useTranslation()
  const table = useHydraPositionsTable(data)

  return (
    <TableContainer css={tableStyles}>
      <TableTitle>
        <Text
          fs={[16, 20]}
          lh={[20, 26]}
          css={{ fontFamily: "FontOver" }}
          fw={500}
          color="white"
        >
          {t("wallet.assets.hydraPositions.title")}
        </Text>
      </TableTitle>
      <Table>
        <TableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableSortHeader
                  key={header.id}
                  canSort={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted()}
                  onSort={header.column.getToggleSortingHandler()}
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
          {table.options.data.length ? (
            table.getRowModel().rows.map((row, i) => (
              <Fragment key={row.id}>
                <TableRow isOdd={!(i % 2)} onClick={() => row.toggleSelected()}>
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
            ))
          ) : (
            <EmptyState />
          )}
        </TableBodyContent>
      </Table>
    </TableContainer>
  )
}
