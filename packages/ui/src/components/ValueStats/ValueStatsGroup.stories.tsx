import type { Meta, StoryObj } from "@storybook/react-vite"

import { ResponsiveScope } from "@/components/ResponsiveScope"

import { ValueStats, ValueStatsGroup } from "./ValueStats"

type Story = StoryObj<typeof ValueStatsGroup>

export default {
  component: ValueStatsGroup,
} satisfies Meta<typeof ValueStatsGroup>

const STATS = [
  { label: "Total TVL", value: "$12.4M" },
  { label: "Loop leverage", value: "3.2x" },
  { label: "Risk profile", value: "Moderate" },
  { label: "Net APY", value: "8.42%" },
  { label: "Vaults", value: "6" },
  { label: "Total borrowed", value: "$3.1M" },
]

const Template = (args: Story["args"]) => (
  <ResponsiveScope
    sx={{
      resize: "horizontal",
      overflow: "hidden",
      width: 900,
      maxWidth: "100%",
      minWidth: 120,
      p: "l",
      border: "1px dashed",
      borderColor: "details.borders",
    }}
  >
    <ValueStatsGroup {...args}>
      {STATS.map((stat) => (
        <ValueStats key={stat.label} wrap size="medium" {...stat} />
      ))}
    </ValueStatsGroup>
  </ResponsiveScope>
)

export const Default: Story = {
  render: Template,
}

export const FullWidth: Story = {
  render: Template,
  args: {
    fullWidth: true,
  },
}

export const CustomGaps: Story = {
  render: Template,
  args: {
    columnGap: "xl",
    rowGap: "m",
  },
}
