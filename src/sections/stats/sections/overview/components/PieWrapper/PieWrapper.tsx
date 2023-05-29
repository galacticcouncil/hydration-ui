import { SPieWrapper } from "./PieWrapper.styled"
import { PieChart } from "sections/stats/components/PieChart/PieChart"
import { PieTotalValue } from "../PieTotalValue/PieTotalValue"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { PieSkeleton } from "sections/stats/components/PieChart/components/Skeleton/Skeleton"
import { ChartSwitchMobile } from "sections/stats/components/ChartSwitchMobile/ChartSwitchMobile"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useState } from "react"

export const PieWrapper = () => {
  const api = useApiPromise()
  const isApi = isApiLoaded(api)
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [activeSection, setActiveSection] = useState<"overview" | "chart">(
    "overview",
  )

  return (
    <SPieWrapper>
      {!isDesktop && (
        <ChartSwitchMobile onClick={setActiveSection} active={activeSection} />
      )}

      {activeSection === "overview" ? (
        isApi ? (
          <PieChart />
        ) : (
          <PieSkeleton />
        )
      ) : (
        <div sx={{ color: "white" }}>TODO: Chart</div>
      )}

      <div sx={{ flex: "column", gap: 20 }}>
        <PieTotalValue title="Total value locked" type="tvl" />
        <div
          sx={{
            flex: ["row", "column"],
            justify: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <PieTotalValue title="HydraDx POL" type="pol" />
          <PieTotalValue title="24 volume" type="volume" />
        </div>
      </div>
    </SPieWrapper>
  )
}
