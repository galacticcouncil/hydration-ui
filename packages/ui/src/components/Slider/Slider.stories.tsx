import type { Meta, StoryObj } from "@storybook/react-vite"
import React, { useState } from "react"

import { Box } from "../Box"
import { Slider } from "./Slider"

type Story = StoryObj<typeof Slider>

export default {
  component: Slider,
} satisfies Meta<typeof Slider>

const Template = (args: React.ComponentPropsWithoutRef<typeof Slider>) => {
  const [value, setValue] = useState(args.value ?? 50)
  return (
    <Box width="5xl">
      <Slider
        {...args}
        value={value}
        min={args.min ?? 0}
        max={args.max ?? 100}
        step={args.step ?? 1}
        onChange={setValue}
      />
    </Box>
  )
}

export const Default: Story = {
  render: Template,
}
