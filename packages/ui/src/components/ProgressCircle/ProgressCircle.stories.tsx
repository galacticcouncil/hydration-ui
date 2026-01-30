import { Meta, StoryObj } from "@storybook/react-vite"
import { ComponentPropsWithoutRef } from "react"

import { getToken } from "@/utils"

import { ProgressCircle } from "./ProgressCircle"

type Story = StoryObj<typeof ProgressCircle>

export default {
  component: ProgressCircle,
} as Meta<typeof ProgressCircle>

const Template = (props: ComponentPropsWithoutRef<typeof ProgressCircle>) => {
  return <ProgressCircle {...props} />
}

export const Default: Story = {
  render: Template,
  args: {
    percent: 33,
  },
}

export const CustomColor: Story = {
  render: Template,
  args: {
    percent: 33,
    color: getToken("colors.successGreen.400"),
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
    label: <span sx={{ fontSize: 24, textAlign: "center" }}>$33</span>,
  },
}

export const ReversedDirection: Story = {
  render: Template,
  args: {
    percent: 33,
    isReversed: true,
  },
}
