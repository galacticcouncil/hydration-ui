import { TableSkeleton } from "components/Table/TableSkeleton"
import { useOrdersTableSkeleton } from "./orders/OtcOrders.utils"
import { OtcHeader } from "./header/OtcHeader"

export const OtcPageSkeleton = () => {
  const table = useOrdersTableSkeleton()

  return (
    <>
      <OtcHeader
        skeleton
        showMyOrders={false}
        showPartial={false}
        onShowMyOrdersChange={() => null}
        onShowPartialChange={() => null}
      />
      <TableSkeleton table={table} />
    </>
  )
}
