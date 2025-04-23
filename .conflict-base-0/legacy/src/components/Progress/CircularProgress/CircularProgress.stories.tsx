import { Meta, StoryObj } from "@storybook/react"
import { ComponentPropsWithoutRef } from "react"
import { CircularProgress } from "./CircularProgress"

type Story = StoryObj<typeof CircularProgress>

export default {
  component: CircularProgress,
} as Meta<typeof CircularProgress>

const Template = (props: ComponentPropsWithoutRef<typeof CircularProgress>) => {
  return <CircularProgress {...props} />
}

export const Default: Story = {
  render: Template,
  args: {
    percent: 33,
  },
}

export const Color: Story = {
  render: Template,
  args: {
    percent: 33,
    color: "red400",
  },
}

export const Thickness: Story = {
  render: Template,
  args: {
    percent: 33,
    thickness: 10,
  },
}

export const Radius: Story = {
  render: Template,
  args: {
    percent: 33,
    radius: 100,
  },
}

export const LabelStart: Story = {
  render: Template,
  args: {
    percent: 33,
    radius: 14,
    labelPosition: "start",
  },
}

export const LabelEnd: Story = {
  render: Template,
  args: {
    percent: 33,
    radius: 14,
    labelPosition: "end",
  },
}

export const CustomLabel: Story = {
  render: Template,
  args: {
    percent: 33,
    children: <span sx={{ fontSize: 24, textAlign: "center" }}>$33</span>,
  },
}

export const InvertedDirection: Story = {
  render: Template,
  args: {
    percent: 33,
    inverted: true,
  },
}
