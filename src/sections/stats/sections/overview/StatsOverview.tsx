import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { StatsTiles } from "./components/tiles/StatsTiles"

export const StatsOverview = () => {
  return (
    <div sx={{ flex: "column", gap: 50 }}>
      <div sx={{ flex: "row", gap: 20 }}>
        <PieWrapper />
      </div>

      <StatsTiles />
    </div>
  )
}
