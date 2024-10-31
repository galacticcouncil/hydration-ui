import { HeaderValuesSkeleton } from "components/Skeleton/HeaderValuesSkeleton"
import { TableSkeleton } from "components/Skeleton/TableSkeleton"
import { SContainer } from "sections/lending/LendingDashboardPage.styled"

export const LendingDashboardSkeleton = () => {
  return (
    <div>
      <HeaderValuesSkeleton size="large" sx={{ mb: [20, 40] }} />
      <SContainer>
        <TableSkeleton rowCount={1} background="transparent" />
        <TableSkeleton rowCount={1} background="transparent" />
        <TableSkeleton rowCount={5} background="transparent" />
        <TableSkeleton rowCount={5} background="transparent" />
      </SContainer>
    </div>
  )
}
