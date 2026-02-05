import type { Meta, StoryObj } from "@storybook/react-vite"
import React from "react"

import { Box } from "../Box"
import { Slider } from "./Slider"

type Story = StoryObj<typeof Slider>

export default {
  component: Slider,
} satisfies Meta<typeof Slider>

const Template = (args: React.ComponentPropsWithoutRef<typeof Slider>) => (
  <Box width="500px">
    <Slider {...args} />
  </Box>
)

export const Default: Story = {
  render: (args) => <Template {...args} />,
}
