import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowUpDown } from "lucide-react"

import { Box } from "@/components/Box"
import { getToken } from "@/utils"

import { AssetSwitcher } from "./AssetSwitcher"

type Story = StoryObj<typeof AssetSwitcher>

export default {
  component: AssetSwitcher,
} satisfies Meta<typeof AssetSwitcher>

const StoryContainer = (args: Story["args"]) => (
  <Box
    width={500}
    bg={getToken("surfaces.themeBasePalette.surfaceHigh")}
    p="xxl"
  >
    <AssetSwitcher {...args} />
  </Box>
)

export const Default: Story = {
  render: StoryContainer,
  args: {
    value: "1 DOT = 5.1234 USDC",
    onSwitchClick: () => {},
    onValueClick: () => {},
  },
}

export const WithoutSwitch: Story = {
  render: StoryContainer,
  args: {
    value: "1 DOT = 5.1234 USDC",
    onValueClick: () => {},
  },
}

export const Loading: Story = {
  render: StoryContainer,
  args: {
    isLoading: true,
    onSwitchClick: () => {},
    onValueClick: () => {},
  },
}

export const CustomIcon: Story = {
  render: StoryContainer,
  args: {
    value: "1 DOT = 5.1234 USDC",
    icon: ArrowUpDown,
    onSwitchClick: () => {},
    onValueClick: () => {},
  },
}

export const ValueDisabled: Story = {
  render: StoryContainer,
  args: {
    value: "Unknown exchange rate",
    valueDisabled: true,
    onSwitchClick: () => {},
  },
}
