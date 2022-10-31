import { useAssetsTable } from "sections/wallet/assets/table/WalletAssetsTable.utils"
import { flexRender } from "@tanstack/react-table"
import {
  STable,
  STableBodyContent,
  STableContainer,
  STableData,
  STableHeaderContent,
  STableRow,
  STableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { Switch } from "components/Switch/Switch"
import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"
import { WalletAssetsTableDetails } from "sections/wallet/assets/table/details/WalletAssetsTableDetails"
import { TableHeader } from "components/Table/Table"

export const WalletAssetsTable = () => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  const table = useAssetsTable()

  return (
    <STableContainer>
      <STableTitle>
        <Text fs={20} lh={26} fw={500} color="white">
          {t("wallet.assets.table.title")}
        </Text>
        <Switch
          value={showAll}
          onCheckedChange={(value) => setShowAll(value)}
          size="small"
          name="showAll"
          label={t("wallet.assets.table.toggle")}
        />
      </STableTitle>
      <STable>
        <STableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <STableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHeader
                  key={header.id}
                  canSort={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted()}
                  onSort={header.column.getToggleSortingHandler()}
                >
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
          {table.getRowModel().rows.map((row, i) => (
            <Fragment key={row.id}>
              <STableRow isOdd={!(i % 2)}>
                {row.getVisibleCells().map((cell) => (
                  <STableData key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </STableData>
                ))}
              </STableRow>
              {row.getIsExpanded() && (
                <STableRow isSub>
                  <STableData colSpan={table.getAllColumns().length}>
                    <WalletAssetsTableDetails
                      origin={row.original.origin}
                      locked={row.original.locked}
                      lockedUSD={row.original.lockedUSD}
                    />
                  </STableData>
                </STableRow>
              )}
            </Fragment>
          ))}
        </STableBodyContent>
      </STable>
    </STableContainer>
  )
}
