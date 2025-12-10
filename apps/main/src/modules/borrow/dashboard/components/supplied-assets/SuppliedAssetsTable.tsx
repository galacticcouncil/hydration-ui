import { useSuppliedAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Modal,
  Paper,
  Separator,
  TableContainer,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"
import { SuppliedAssetsHeader } from "@/modules/borrow/dashboard/components/supplied-assets/SuppliedAssetsHeader"
import { useSuppliedAssetsTableColumns } from "@/modules/borrow/dashboard/components/supplied-assets/SuppliedAssetsTable.columns"
import {
  RemoveMoneyMarketLiquidity,
  TRemoveMoneyMarketLiquidityProps,
} from "@/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity"

export const SuppliedAssetsTable = () => {
  const { t } = useTranslation(["borrow"])
  const [modalProps, setModalProps] = useState<
    Omit<TRemoveMoneyMarketLiquidityProps, "onSubmitted"> | undefined
  >()
  const columns = useSuppliedAssetsTableColumns({ omRemove: setModalProps })
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
    <>
      <TablePaper>
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
              data={data}
              columns={columns}
            />
          </TableContainer>
        )}
      </TablePaper>

      <Modal open={!!modalProps} onOpenChange={() => setModalProps(undefined)}>
        {!!modalProps && (
          <RemoveMoneyMarketLiquidity
            {...modalProps}
            closable
            onSubmitted={() => setModalProps(undefined)}
          />
        )}
      </Modal>
    </>
  )
}
