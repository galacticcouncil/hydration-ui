import type { Meta, StoryObj } from "@storybook/react-vite"
import React, { useState } from "react"

import { Box } from "../Box"
import { Slider } from "./Slider"

type Story = StoryObj<typeof Slider>

export default {
  component: Slider,
} satisfies Meta<typeof Slider>

const Template = (args: React.ComponentPropsWithoutRef<typeof Slider>) => {
  const [value, setValue] = useState(args.value)

  return (
    <Box width="500px">
      <Slider {...args} value={value} onChange={setValue} />
    </Box>
  )
}

export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 40,
  },
  render: (args) => <Template {...args} />,
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  render: (args) => <Template {...args} />,
}

const LEVERAGE_LABELS = [1.1, 2, 3, 4, 5]
const LEVERAGE_TICKS = Array.from({ length: 19 }, (_, i) => 1.2 + i * 0.2)
  .map((value) => Math.round(value * 10) / 10)
  .filter((value) => !LEVERAGE_LABELS.includes(value))

export const WithMarks: Story = {
  args: {
    min: 1.1,
    max: 5,
    step: 0.1,
    value: 3,
    marks: [
      ...LEVERAGE_LABELS.map((value) => ({
        value,
        label: `${value.toFixed(1)}×`,
      })),
      ...LEVERAGE_TICKS.map((value) => ({ value })),
    ],
  },
  render: (args) => <Template {...args} />,
}
