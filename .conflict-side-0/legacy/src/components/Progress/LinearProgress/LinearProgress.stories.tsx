import { Meta, StoryObj } from "@storybook/react"
import { ComponentPropsWithoutRef } from "react"
import { LinearProgress } from "./LinearProgress"

type Story = StoryObj<typeof LinearProgress>

export default {
  component: LinearProgress,
} as Meta<typeof LinearProgress>

const Template = (props: ComponentPropsWithoutRef<typeof LinearProgress>) => {
  return <LinearProgress {...props} />
}

export const Default: Story = {
  render: Template,
  args: {
    percent: 75,
  },
}

export const SolidColor: Story = {
  render: Template,
  args: {
    percent: 75,
    color: "green400",
  },
}

export const GradientColor: Story = {
  render: Template,
  args: {
    percent: 75,
    color: "brightBlue600",
    colorEnd: "pink600",
  },
}

export const Small: Story = {
  render: Template,
  args: {
    percent: 75,
    size: "small",
  },
}

export const Medium: Story = {
  render: Template,
  args: {
    percent: 75,
    size: "medium",
  },
}

export const Large: Story = {
  render: Template,
  args: {
    percent: 75,
    size: "large",
  },
}

export const LabelColor: Story = {
  render: Template,
  args: {
    percent: 75,
    color: "red400",
    labelColor: "red300",
  },
}

export const LabelStart: Story = {
  render: Template,
  args: {
    percent: 75,
    labelPosition: "start",
  },
}

export const LabelHidden: Story = {
  render: Template,
  args: {
    percent: 75,
    labelPosition: "none",
  },
}

export const CustomLabel: Story = {
  render: Template,
  args: {
    percent: 75,
    children: (
      <span sx={{ fontSize: 16, textAlign: "center" }}>$75 of $100</span>
    ),
  },
}
