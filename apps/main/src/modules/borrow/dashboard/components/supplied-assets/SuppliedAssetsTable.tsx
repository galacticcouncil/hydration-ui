import { useSuppliedAssetsData } from "@galacticcouncil/money-market/hooks"
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

import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"
import { SuppliedAssetsHeader } from "@/modules/borrow/dashboard/components/supplied-assets/SuppliedAssetsHeader"
import { useSuppliedAssetsTableColumns } from "@/modules/borrow/dashboard/components/supplied-assets/SuppliedAssetsTable.columns"

export const SuppliedAssetsTable = () => {
  const { t } = useTranslation(["borrow"])
  const columns = useSuppliedAssetsTableColumns()
  const { data, isLoading } = useSuppliedAssetsData()
  const navigate = useNavigate()
  const { isMobile } = useBreakpoints()

  if (!isLoading && data.length === 0) {
    return (
      <Paper p={20}>
        <Text fw={500} color={getToken("text.low")}>
          {t("supplied.table.empty")}
        </Text>
      </Paper>
    )
  }

  return (
    <Paper>
      <SuppliedAssetsHeader />
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
            hoverable
            data={data}
            columns={columns}
          />
        </TableContainer>
      )}
    </Paper>
  )
}
