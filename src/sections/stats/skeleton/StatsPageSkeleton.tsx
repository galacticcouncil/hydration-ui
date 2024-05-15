import { TableSkeleton } from "components/Skeleton/TableSkeleton"
import { Spinner } from "components/Spinner/Spinner"
import Skeleton from "react-loading-skeleton"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"

export const StatsPageSkeleton = () => {
  return (
    <>
      <div>
        <Skeleton width={200} height={24} sx={{ mb: 30 }} />
        <div sx={{ flex: "row", gap: 20, mb: 30 }}>
          <Skeleton width={100} height={36} />
          <Skeleton width={100} height={36} />
        </div>
      </div>
      <div sx={{ flex: "column", gap: [24, 50] }}>
        <div sx={{ flex: ["column", "row"], gap: 20, height: ["auto", 690] }}>
          <SContainerVertical
            sx={{
              p: [20, 40],
              width: ["100%", 420],
              minWidth: 0,
            }}
          >
            <PieSkeleton />
            <Skeleton sx={{ mt: 12, height: [20, 52] }} />
            <Skeleton sx={{ mt: 12, height: [20, 52] }} />
            <Skeleton sx={{ mt: 12, height: [20, 52] }} />
          </SContainerVertical>
          <SContainerVertical
            css={{ position: "relative" }}
            sx={{
              p: 24,
              justify: "space-between",
              flexGrow: 1,
              minWidth: 0,
              gap: 20,
              minHeight: 300,
            }}
          >
            <div>
              <div sx={{ flex: "row", gap: 20, mb: 20 }}>
                <Skeleton width={80} height={36} />
                <Skeleton width={80} height={36} />
              </div>
              <Skeleton width="30%" height={20} />
            </div>
            <div
              css={{ position: "absolute", inset: 0 }}
              sx={{ flex: "column", align: "center", justify: "center" }}
            >
              <Spinner size={50} />
            </div>
          </SContainerVertical>
        </div>
        <TableSkeleton titleSkeleton background="transparent" />
      </div>
    </>
  )
}
