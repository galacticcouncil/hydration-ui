import { Meta, StoryObj } from "@storybook/react"
import { VerticalBarChart } from "./VerticalBarChart"
import { omit } from "utils/rx"

type Story = StoryObj<typeof VerticalBarChart>

export default {
  component: VerticalBarChart,
} as Meta<typeof VerticalBarChart>

const DATA = [
  {
    value: 30000000,
    label: "Stablepool",
    color: "#3DFDA4",
  },
  {
    value: 40000000,
    label: "Omnipool",
    color: "#FF2982",
  },
  {
    value: 15000000,
    label: "Money Market",
    color: "#05C5FF",
  },
  {
    value: 20000000,
    label: "Isolated pools",
    color: "#564FB2",
  },
  {
    value: 8000000,
    label: "Treasury",
    color: "#FFA629",
  },
]

const Template = (props: Story["args"]) => {
  return <VerticalBarChart {...props} data={props?.data ?? []} />
}

export const Default: Story = {
  render: Template,
  args: {
    data: DATA.map((bar) => omit(["color"], bar)),
  },
}

export const CustomColors = {
  render: Template,
  args: {
    data: DATA,
  },
}

export const SlantedBars = {
  render: Template,
  args: {
    data: DATA,
    slanted: true,
  },
}
