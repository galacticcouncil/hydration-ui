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
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { BorrowedAssetsHeader } from "@/modules/borrow/dashboard/components/borrowed-assets/BorrowedAssetsHeader"
import { useBorrowedAssetsTableColumns } from "@/modules/borrow/dashboard/components/borrowed-assets/BorrowedAssetsTable.columns"
import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"

export const BorrowedAssetsTable = () => {
  const { t } = useTranslation(["borrow"])
  const columns = useBorrowedAssetsTableColumns()
  const { data, isLoading } = useBorrowedAssetsData()
  const navigate = useNavigate()
  const { isMobile } = useBreakpoints()

  if (!isLoading && data.length === 0) {
    return (
      <Paper p={20}>
        <Text fw={500} color={getToken("text.low")}>
          {t("borrowed.table.empty")}
        </Text>
      </Paper>
    )
  }

  return (
    <TablePaper isTransparent>
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
            onRowClick={(row) =>
              navigate({
                to: `/borrow/markets/${row.underlyingAsset}`,
              })
            }
            fixedLayout
            data={data}
            columns={columns}
          />
        </TableContainer>
      )}
    </TablePaper>
  )
}
