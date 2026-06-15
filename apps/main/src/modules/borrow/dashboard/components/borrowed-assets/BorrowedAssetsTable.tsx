import { useBorrowedAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  Separator,
  TableContainer,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { BorrowedAssetsHeader } from "@/modules/borrow/dashboard/components/borrowed-assets/BorrowedAssetsHeader"
import { useBorrowedAssetsTableColumns } from "@/modules/borrow/dashboard/components/borrowed-assets/BorrowedAssetsTable.columns"
import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"
import { useNavigateToReserve } from "@/modules/borrow/hooks/useNavigateToReserve"

export const BorrowedAssetsTable = () => {
  const { t } = useTranslation(["borrow"])
  const columns = useBorrowedAssetsTableColumns()
  const { data, isLoading } = useBorrowedAssetsData()
  const navigateToReserve = useNavigateToReserve()
  const { isMobile } = useBreakpoints()

  const sort = useDataTableUrlSorting("/borrow/dashboard", "borrowedSort")

  if (!isLoading && data.length === 0) {
    return (
      <Paper p="xl">
        <Text fw={500} color={getToken("text.low")}>
          {t("borrowed.table.empty")}
        </Text>
      </Paper>
    )
  }

  return (
    <TablePaper>
      <BorrowedAssetsHeader />
      <Separator />
      {isMobile ? (
        <StackedTable
          skeletonRowCount={4}
          isLoading={isLoading}
          data={data}
          columns={columns}
        />
      ) : (
        <TableContainer>
          <DataTable
            skeletonRowCount={4}
            isLoading={isLoading}
            onRowClick={(row) => navigateToReserve(row.underlyingAsset)}
            fixedLayout
            data={data}
            columns={columns}
            {...sort}
          />
        </TableContainer>
      )}
    </TablePaper>
  )
}
