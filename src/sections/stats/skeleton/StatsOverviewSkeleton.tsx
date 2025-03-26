import { ChartState } from "components/Charts/components/ChartState"
import { DataValue } from "components/DataValue"
import Skeleton from "react-loading-skeleton"
import { SContainerVertical } from "sections/stats/StatsPage.styled"

export const StatsOverviewSkeleton = () => {
  return (
    <div sx={{ flex: "column", gap: [24, 50] }}>
      <SContainerVertical sx={{ p: [20, 40] }}>
        <DataValue
          size="extra-large"
          label={<Skeleton height={14} width={90} />}
          isLoading
        />
        <div css={{ position: "relative", height: 205 }}>
          <ChartState state="loading" />
        </div>
        <div
          sx={{
            flex: "row",
            flexWrap: "wrap",
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <DataValue
              sx={{ width: ["50%", "33%"], mt: 50 }}
              key={index}
              size="extra-large"
              label={<Skeleton height={14} width={90} />}
              isLoading
            />
          ))}
        </div>
      </SContainerVertical>
    </div>
  )
}
