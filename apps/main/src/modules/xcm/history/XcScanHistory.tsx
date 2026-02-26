import {
  DataTable,
  JsonView,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { getJourneyVaaHeader } from "@/modules/xcm/history/utils/claim"

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
        expandable
        renderSubComponent={(journey) => {
          const vaaHeader = getJourneyVaaHeader(journey)
          return (
            <JsonView
              src={{
                stops: journey.stops,
                ...(vaaHeader && { vaaHeader }),
              }}
              collapseObjectsAfterLength={4}
            />
          )
        }}
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
