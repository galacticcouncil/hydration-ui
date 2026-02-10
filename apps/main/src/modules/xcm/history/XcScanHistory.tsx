import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"

import { useXcScan } from "./useXcScan"
import { useXcScanHistoryColumns } from "./XcScanHistoryTable.columns"

type Props = {
  readonly address: string
}

export const XcScanHistory = ({ address }: Props) => {
  const { t } = useTranslation("xcm")
  const columns = useXcScanHistoryColumns()

  const { data } = useXcScan(address)

  const pagination = useDataTableUrlPagination("/cross-chain/history", "page")
  const sort = useDataTableUrlSorting("/cross-chain/history", "sort", {
    onChange: () => pagination.onPageClick(1),
  })

  return (
    <TableContainer as={Paper}>
      <DataTable
        paginated
        data={data}
        columns={columns}
        emptyState={
          <EmptyState
            header={t("history.emptyState.noTransfers")}
            description={
              address
                ? t("history.emptyState.empty")
                : t("history.emptyState.connectWallet")
            }
          />
        }
        {...sort}
        {...pagination}
      />
    </TableContainer>
  )
}
