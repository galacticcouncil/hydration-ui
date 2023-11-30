import { flexRender } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
import {
  Table,
  TableBodyContent,
  TableContainer,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  FarmingPositionsTableData,
  useFarmingPositionsTable,
} from "./WalletFarmingPositions.utils"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { STableData } from "sections/wallet/assets/hydraPositions/WalletHydraPositions.styled"
import { FarmingPositionsDetailsMob } from "./details/FarmingPositionsDetailsMob"
import { useMedia } from "react-use"
import { theme } from "theme"

type Props = { data: FarmingPositionsTableData[] }

export const WalletFarmingPositions = ({ data }: Props) => {
  const { t } = useTranslation()
  const [row, setRow] = useState<FarmingPositionsTableData | undefined>(
    undefined,
  )

  const table = useFarmingPositionsTable(data)

  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <>
      <TableContainer css={assetsTableStyles}>
        <TableTitle>
          <Text
            fs={[16, 20]}
            lh={[20, 26]}
            css={{ fontFamily: "FontOver" }}
            fw={500}
            color="white"
          >
            {t("wallet.assets.farmingPositions.title")}
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
            {table.getRowModel().rows.map((row, i) => (
              <Fragment key={row.id}>
                <TableRow
                  isOdd={!(i % 2)}
                  onClick={() => {
                    !isDesktop && setRow(row.original)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <STableData key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </STableData>
                  ))}
                </TableRow>
              </Fragment>
            ))}
          </TableBodyContent>
        </Table>
      </TableContainer>
      {!isDesktop && (
        <FarmingPositionsDetailsMob
          row={row}
          onClose={() => setRow(undefined)}
        />
      )}
    </>
  )
}
