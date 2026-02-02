import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"

import { useXcScan } from "./useXcScan"
import { useXcScanHistoryColumns } from "./XcScanHistoryTable.columns"

type Props = {
  readonly address: string
}

export const XcScanHistory = ({ address }: Props) => {
  const columns = useXcScanHistoryColumns()

  const { data } = useXcScan(address)

  return (
    <TableContainer as={Paper}>
      <DataTable
        paginated
        data={data}
        columns={columns}
        pageSize={50}
        emptyState={
          <div>
            {address
              ? "No transfer history found"
              : "Please connect a wallet to view transfer history"}
          </div>
        }
      />
    </TableContainer>
  )
}
