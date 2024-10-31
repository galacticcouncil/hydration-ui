import { AreaChartSkeleton } from "components/Charts/AreaChart/AreaChartSkeleton"
import { HeaderValuesSkeleton } from "components/Skeleton/HeaderValuesSkeleton"
import { Spacer } from "components/Spacer/Spacer"
import Skeleton from "react-loading-skeleton"
import {
  SContent,
  SContainer,
} from "sections/lending/LendingReserveOverviewPage.styled"

export const ReserveActionsSkeleton = () => {
  const RowSkeleton = (
    <div>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div>
          <Skeleton width={100} height={14} sx={{ mt: 4, mb: 8 }} />
          <Skeleton width={75} height={12} />
        </div>
        <Skeleton height={36} width={96} />
      </div>
    </div>
  )

  return (
    <>
      <div sx={{ flex: "row", gap: 12, mb: 30 }}>
        <Skeleton width={42} height={42} />
        <div>
          <Skeleton width={100} height={12} sx={{ mt: 4, mb: 8 }} />
          <Skeleton width={100} height={14} />
        </div>
      </div>

      <div>
        <div sx={{ flex: "column", gap: 12 }}>
          {RowSkeleton}
          <Spacer
            size={1}
            sx={{ bg: "darkBlue401", width: "100%", my: 12 }}
            axis="horizontal"
          />
          {RowSkeleton}
        </div>
      </div>
    </>
  )
}

export const LendingReserveOverviewSkeleton = () => {
  return (
    <>
      <HeaderValuesSkeleton size="small" sx={{ mb: [20, 40] }} />
      <SContent>
        <SContainer active>
          <div>
            <Skeleton width="50%" sx={{ mb: 10 }} />
            <Skeleton width="20%" sx={{ mb: [20, 40] }} />
            <HeaderValuesSkeleton count={4} size="small" />
          </div>
          <div sx={{ bg: "bg", height: 4, mx: [-20, -30], my: [20, 40] }} />
          <div>
            <Skeleton width="50%" sx={{ mb: 10 }} />
            <Skeleton width="20%" sx={{ mb: [20, 40] }} />
            <AreaChartSkeleton state="loading" color="basic600" />
            <HeaderValuesSkeleton count={4} size="small" sx={{ mt: -50 }} />
          </div>
          <div sx={{ bg: "bg", height: 4, mx: [-20, -30], my: [20, 40] }} />
          <div>
            <Skeleton width="50%" sx={{ mb: 10 }} />
            <Skeleton width="20%" sx={{ mb: [20, 40] }} />
            <HeaderValuesSkeleton count={4} size="small" />
          </div>
        </SContainer>
        <SContainer active>
          <ReserveActionsSkeleton />
        </SContainer>
      </SContent>
    </>
  )
}
