import type { Meta, StoryObj } from "@storybook/react-vite"
import { Fragment } from "react"

import { Grid, Text } from "@/components"
import { getToken } from "@/utils"

import { ProgressBar, ProgressBarProps } from "./ProgressBar"

type Variant = NonNullable<ProgressBarProps["variant"]>

const VARIANTS = [
  "accent",
  "success",
  "warning",
  "danger",
  "info",
  "gradient",
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "teal",
  "cyan",
  "blue",
  "purple",
  "pink",
] satisfies Variant[]

const meta = {
  component: ProgressBar,
  args: {
    value: 60,
    variant: "accent",
    size: "medium",
    animated: false,
    hideLabel: false,
    format: (value) => `${value}%`,
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    variant: { control: "select", options: VARIANTS },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    animated: { control: "boolean" },
    hideLabel: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  args: { hideLabel: true },
  render: ({ value, size, animated, hideLabel, format }) => (
    <Grid columnTemplate="auto 1fr" gap="l" align="center">
      {VARIANTS.map((variant) => (
        <Fragment key={variant}>
          <Text fs="p6" color={getToken("text.medium")}>
            {variant}
          </Text>
          <ProgressBar
            value={value}
            size={size}
            variant={variant}
            animated={animated}
            hideLabel={hideLabel}
            format={format}
          />
        </Fragment>
      ))}
    </Grid>
  ),
}

export const Animated: Story = {
  args: { animated: true },
  render: (args) => (
    <Grid gap="l">
      <ProgressBar {...args} variant="gradient" />
      <ProgressBar {...args} variant="accent" />
    </Grid>
  ),
}
