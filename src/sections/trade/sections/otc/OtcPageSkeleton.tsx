import { TableSkeleton } from "components/Table/TableSkeleton"
import { useOrdersTableSkeleton } from "./orders/OtcOrders.utils"
import { OtcHeader } from "./header/OtcHeader"

export const OtcPageSkeleton = () => {
  const table = useOrdersTableSkeleton()

  return (
    <>
      <OtcHeader
        skeleton
        searchVal={""}
        showMyOrders={false}
        showPartial={false}
        onSearchChange={() => null}
        onShowMyOrdersChange={() => null}
        onShowPartialChange={() => null}
        searchVal={""}
        onSearchChange={() => null}
      />
      <TableSkeleton table={table} />
    </>
  )
}
