import { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"

import { getToken } from "@/utils"

import { Box } from "../Box"
import { AssetInput } from "./AssetInput"

type Story = StoryObj<typeof AssetInput>

export default {
  component: AssetInput,
} satisfies Meta<typeof AssetInput>

const SPOT_PRICE = "0.1234"
const MAX_BALANCE = "12345"

const Template = (args: React.ComponentPropsWithoutRef<typeof AssetInput>) => {
  const [value, setValue] = useState<string>()

  const dollarValue =
    value !== undefined ? Number(SPOT_PRICE) * Number(value) : undefined

  return (
    <Box
      width={500}
      bg={getToken("surfaces.themeBasePalette.surfaceHigh")}
      height={500}
      p={24}
    >
      <AssetInput
        {...args}
        value={args.value ?? value}
        maxBalance={args.maxBalance ?? MAX_BALANCE}
        dollarValue={args.dollarValue ?? dollarValue?.toString()}
        onChange={setValue}
        label="Sell"
      />
    </Box>
  )
}

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    symbol: "HDX",
  },
}

export const EmptyAssetSelector: Story = {
  render: (args) => <Template {...args} />,
}

export const ErrorAssetSelector: Story = {
  render: (args) => <Template {...args} />,
  args: {
    symbol: "HDX",
    value: "1234",
    dollarValue: "123",
    error: "Not enough balance",
  },
}

export const AssetSelectorWithNoMaxBalance: Story = {
  render: (args) => <Template {...args} />,
  args: {
    symbol: "HDX",
    maxBalance: "0",
  },
}

export const AssetSelectorLoading: Story = {
  render: (args) => <Template {...args} />,
  args: {
    loading: true,
  },
}
