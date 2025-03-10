import { TableSkeleton } from "components/Skeleton/TableSkeleton"
import { defaultPaginationState } from "components/Table/TablePagination"
import { SContainer } from "sections/lending/LendingDashboardPage.styled"

export const LendingHistorySkeleton = () => {
  return (
    <SContainer>
      <TableSkeleton rowCount={1} background="transparent" />
      <TableSkeleton
        rowCount={defaultPaginationState.pageSize}
        background="transparent"
      />
    </SContainer>
  )
}
