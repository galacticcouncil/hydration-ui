import { flexRender } from "@tanstack/react-table"
import { Switch } from "components/Switch/Switch"
import { TableSortHeader } from "components/Table/Table"
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
import { Fragment, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { WalletAssetsTableDetails } from "sections/wallet/assets/table/details/WalletAssetsTableDetails"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import {
  AssetsTableData,
  useAssetsTable,
} from "sections/wallet/assets/table/WalletAssetsTable.utils"
import { WalletTransferModal } from "sections/wallet/transfer/WalletTransferModal"
import { theme } from "theme"
import { WalletAssetsTableActionsMob } from "./actions/WalletAssetsTableActionsMob"

type Props = { data: AssetsTableData[] }

export const WalletAssetsTable = ({ data }: Props) => {
  const { t } = useTranslation()
  const [row, setRow] = useState<AssetsTableData | undefined>(undefined)
  const [showAll, setShowAll] = useState(true)
  const [transferAsset, setTransferAsset] = useState<string | null>(null)

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const filteredData = useMemo(
    () => (showAll ? data : data.filter((row) => !row.total.isZero())),
    [data, showAll],
  )

  const table = useAssetsTable(filteredData, { onTransfer: setTransferAsset })

  return (
    <TableContainer css={assetsTableStyles}>
      <TableTitle>
        <Text
          fs={[16, 20]}
          lh={[20, 26]}
          css={{ fontFamily: "FontOver" }}
          fw={500}
          color="white"
        >
          {isDesktop
            ? t("wallet.assets.table.title")
            : t("wallet.header.assets")}
        </Text>
        <Switch
          value={showAll}
          onCheckedChange={(value) => setShowAll(value)}
          size="small"
          name="showAll"
          label={t("wallet.assets.table.toggle")}
        />
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
                  <TableData key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableData>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow isSub>
                  <TableData colSpan={table.getAllColumns().length}>
                    <WalletAssetsTableDetails
                      origin={row.original.origin}
                      locked={row.original.locked}
                      lockedUSD={row.original.lockedUSD}
                    />
                  </TableData>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBodyContent>
      </Table>
      {transferAsset && (
        <WalletTransferModal
          open
          initialAsset={transferAsset}
          onClose={() => setTransferAsset(null)}
        />
      )}
      {!isDesktop && (
        <WalletAssetsTableActionsMob
          row={row}
          onClose={() => setRow(undefined)}
          onTransferClick={setTransferAsset}
        />
      )}
    </TableContainer>
  )
}
