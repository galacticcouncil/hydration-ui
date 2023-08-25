import { Bar, BarChart, Cell, ResponsiveContainer } from "recharts"
import {
  ChartState,
  TChartState,
} from "components/Charts/components/ChartState"

const per = [
  7, 4, 10, 25, 21, 58, 47, 64, 67, 49, 61, 85, 89, 63, 98, 83, 86, 67, 81, 85,
  45, 78, 89, 65, 49, 64, 51, 47, 38, 45, 29, 49, 58, 63, 66, 59, 45, 51, 63,
  68, 52, 62, 66, 98, 52, 79, 77, 57, 46, 47, 41, 49, 30, 19,
]

const skeletonData = per.map((el) => ({ y: el }))

export const BarChartSkeleton = ({ state }: { state: TChartState }) => {
  return (
    <div sx={{ width: "100%", height: 450 }}>
      <ChartState state={state} />
      <ResponsiveContainer css={{ filter: "blur(12px)" }}>
        <BarChart data={skeletonData}>
          <defs>
            <linearGradient id="gradient" x1=".5" x2=".5" y2="1">
              <stop offset=".455" stopColor="#85d1ff" stopOpacity=".61" />
              <stop offset=".928" stopColor="#4fc0ff" stopOpacity=".17" />
            </linearGradient>
          </defs>
          <Bar dataKey="y">
            {skeletonData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={"url(#gradient)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
