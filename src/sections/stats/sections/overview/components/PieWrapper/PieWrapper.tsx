import { Text } from "components/Typography/Text/Text"
import { SPieWrapper } from "./PieWrapper.styled"
import { PieChartComponent } from "sections/stats/components/PieChart/PieChart"

export const PieWrapper = () => {
  return (
    <SPieWrapper>
      <div sx={{ width: 300, height: 300 }}>
        <PieChartComponent />
      </div>
      <div sx={{ flex: "column", gap: 20 }}>
        <div sx={{ flex: "column", gap: 8 }}>
          <Text color="brightBlue300">Total value locked</Text>
          <Text fs={42} font="FontOver">
            8 301 874
          </Text>
        </div>
        <div sx={{ flex: "column", gap: 8 }}>
          <Text color="brightBlue300">HydraDx POL</Text>
          <Text fs={42} font="FontOver">
            13.2m
          </Text>
        </div>
        <div sx={{ flex: "column", gap: 8 }}>
          <Text color="brightBlue300">24 volume</Text>
          <Text fs={42} font="FontOver">
            13.2m
          </Text>
        </div>
      </div>
    </SPieWrapper>
  )
}
