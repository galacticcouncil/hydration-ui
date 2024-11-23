import { HeaderValuesSkeleton } from "components/Skeleton/HeaderValuesSkeleton"
import { InputSkeleton } from "components/Skeleton/InputSkeleton"
import { TableSkeleton } from "components/Skeleton/TableSkeleton"

export const LendingMarketsSkeleton = () => {
  return (
    <div>
      <HeaderValuesSkeleton size="large" sx={{ mb: [20, 40] }} />
      <InputSkeleton sx={{ mb: 20 }} />
      <TableSkeleton />
    </div>
  )
}
