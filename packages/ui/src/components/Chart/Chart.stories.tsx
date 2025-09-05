import type { Meta, StoryObj } from "@storybook/react"
import { PlusIcon } from "lucide-react"

import { ChartConfig } from "@/components"
import {
  MOCK_CATEGORY_DATA,
  MOCK_CURVE_DATA,
  MOCK_TIME_DATA,
} from "@/components/Chart/utils"

import { ChartContainer } from "./ChartContainer"
import { AreaChart } from "./charts/AreaChart"
import { BarChart } from "./charts/BarChart"

type Story = StoryObj<typeof ChartContainer>

export default {
  component: ChartContainer,
} as Meta<typeof ChartContainer>

const SINGLE_SERIES_CONFIG = {
  xAxisKey: "month",
  series: [
    {
      key: "desktop",
      label: "Desktop",
      color: "#6fc272",
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any satisfies ChartConfig<(typeof MOCK_CATEGORY_DATA)[number]>

const MULTI_SERIES_CONFIG = {
  xAxisKey: "month",
  series: [
    {
      key: "desktop",
      label: "Desktop",
      color: "#6fc272",
    },
    {
      key: "mobile",
      label: "Mobile",
      color: "#98C8F8",
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any satisfies ChartConfig<(typeof MOCK_CATEGORY_DATA)[number]>

const TIME_SERIES_CONFIG = {
  xAxisKey: "timestamp",
  xAxisType: "time",
  tooltipType: "timeTop",
  series: [
    {
      label: "Value",
      key: "value",
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any satisfies ChartConfig<(typeof MOCK_TIME_DATA)[number]>

const CURVE_SERIES_CONFIG = {
  xAxisKey: "x",
  series: [
    {
      key: "y",
      label: "Value",
      color: ["#FC408C", "#57B3EB"],
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any satisfies ChartConfig<(typeof MOCK_CURVE_DATA)[number]>

export const Area: Story = {
  render: (args) => (
    <AreaChart height={400} {...args} data={MOCK_CATEGORY_DATA} />
  ),
  args: {
    height: 400,
    config: SINGLE_SERIES_CONFIG,
  },
}

export const AreaLabels: Story = {
  render: (args) => (
    <AreaChart
      height={400}
      {...args}
      data={MOCK_CATEGORY_DATA}
      yAxisLabel="Device Usage"
      xAxisLabel="Month"
      yAxisProps={{ tickCount: 2 }}
      xAxisProps={{ tick: false }}
    />
  ),
  args: {
    height: 400,
    config: SINGLE_SERIES_CONFIG,
  },
}

export const AreaMultiSeries: Story = {
  render: (args) => <AreaChart {...args} data={MOCK_CATEGORY_DATA} />,
  args: {
    height: 400,
    config: MULTI_SERIES_CONFIG,
  },
}

export const AreaLinearCurve: Story = {
  render: (args) => (
    <AreaChart {...args} data={MOCK_CATEGORY_DATA} curveType="linear" />
  ),
  args: {
    height: 400,
    config: MULTI_SERIES_CONFIG,
  },
}

export const AreaTimeTooltip: Story = {
  render: (args) => <AreaChart {...args} data={MOCK_TIME_DATA} />,
  args: {
    height: 400,
    config: TIME_SERIES_CONFIG,
  },
}

export const AreaHiddenTooltip: Story = {
  render: (args) => <AreaChart {...args} data={MOCK_TIME_DATA} />,
  args: {
    height: 400,
    config: {
      ...TIME_SERIES_CONFIG,
      tooltipType: "none",
    },
  },
}

export const AreaHiddenAxes: Story = {
  render: (args) => (
    <AreaChart
      {...args}
      data={MOCK_TIME_DATA}
      yAxisHidden
      xAxisHidden
      verticalGridHidden
      horizontalGridHidden
    />
  ),
  args: {
    height: 400,
    config: TIME_SERIES_CONFIG,
  },
}

export const AreaGradientLine: Story = {
  render: (args) => (
    <AreaChart
      {...args}
      data={MOCK_CURVE_DATA}
      gradient="line"
      xAxisProps={{ type: "number", tickCount: 10, interval: "preserveStart" }}
      yAxisProps={{ type: "number", padding: { bottom: 2 } }}
      strokeWidth={4}
    />
  ),
  args: {
    height: 400,
    config: CURVE_SERIES_CONFIG,
  },
}

export const AreaCustomDot: Story = {
  render: (args) => (
    <AreaChart
      {...args}
      data={MOCK_CURVE_DATA}
      gradient="line"
      xAxisProps={{ type: "number", tickCount: 10, interval: "preserveStart" }}
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
    />
  ),
  args: {
    height: 400,
    config: CURVE_SERIES_CONFIG,
  },
}

export const Bar: Story = {
  render: (args) => <BarChart {...args} data={MOCK_CATEGORY_DATA} />,
  args: {
    height: 400,
    config: SINGLE_SERIES_CONFIG,
  },
}

export const BarLabels: Story = {
  render: (args) => (
    <BarChart
      height={400}
      {...args}
      data={MOCK_CATEGORY_DATA}
      yAxisLabel="Device Usage"
      xAxisLabel="Month"
      yAxisProps={{ tickCount: 2 }}
      xAxisProps={{ tick: false }}
    />
  ),
  args: {
    height: 400,
    config: SINGLE_SERIES_CONFIG,
  },
}

export const BarMultiSeries: Story = {
  render: (args) => <BarChart {...args} data={MOCK_CATEGORY_DATA} />,
  args: {
    height: 400,
    config: MULTI_SERIES_CONFIG,
  },
}

export const BarCustomBarSize: Story = {
  render: (args) => (
    <BarChart {...args} data={MOCK_CATEGORY_DATA} barSize={10} />
  ),
  args: {
    height: 400,
    config: MULTI_SERIES_CONFIG,
  },
}

export const BarStacked: Story = {
  render: (args) => <BarChart {...args} data={MOCK_CATEGORY_DATA} stacked />,
  args: {
    height: 400,
    config: MULTI_SERIES_CONFIG,
  },
}

export const BarVerticalLayout: Story = {
  render: (args) => (
    <BarChart {...args} data={MOCK_CATEGORY_DATA} layout="vertical" stacked />
  ),
  args: {
    height: 600,
    config: MULTI_SERIES_CONFIG,
  },
}

export const BarTimeTooltip: Story = {
  render: (args) => <BarChart {...args} data={MOCK_TIME_DATA} />,
  args: {
    height: 400,
    config: {
      ...TIME_SERIES_CONFIG,
      tooltipType: "timeTop",
    },
  },
}

export const BarHiddenTooltip: Story = {
  render: (args) => <BarChart {...args} data={MOCK_CATEGORY_DATA} />,
  args: {
    height: 400,
    config: {
      ...SINGLE_SERIES_CONFIG,
      tooltipType: "none",
    },
  },
}

export const BarHiddenAxes: Story = {
  render: (args) => (
    <BarChart
      {...args}
      data={MOCK_CATEGORY_DATA}
      yAxisHidden
      xAxisHidden
      verticalGridHidden
    />
  ),
  args: {
    height: 400,
    config: SINGLE_SERIES_CONFIG,
  },
}
