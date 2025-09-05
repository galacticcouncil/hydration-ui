import { PlusIcon } from "@galacticcouncil/ui/assets/icons"
import { AreaChart } from "@galacticcouncil/ui/components"
import { MOCK_CURVE_DATA } from "@galacticcouncil/ui/components/Chart/utils"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/staking/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AreaChart
      aspectRatio="16 / 9"
      data={MOCK_CURVE_DATA}
      gradient="line"
      xAxisProps={{
        type: "number",
        tickCount: 10,
        interval: "preserveStart",
      }}
      yAxisProps={{ type: "number", tickCount: 2, padding: { bottom: 16 } }}
      yAxisLabel="Payable Percentage"
      xAxisLabel="Days"
      strokeWidth={4}
      customDot={({ key, payload, cx = 0, cy = 0 }) => (
        <>
          {payload.current && (
            <PlusIcon key={key} x={cx - 12} y={cy - 12} color="#FFD230" />
          )}
          {payload.currentSecondary && (
            <PlusIcon key={key} x={cx - 12} y={cy - 12} color="#ED6AFF" />
          )}
        </>
      )}
      config={{
        xAxisKey: "x",
        tooltipType: "none",
        series: [
          {
            key: "y",
            label: "Value",
            color: ["#FC408C", "#57B3EB"],
          },
        ],
      }}
    />
  )
}
