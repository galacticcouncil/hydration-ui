import { Meta, StoryObj } from "@storybook/react"
import { ComponentPropsWithoutRef, useState } from "react"
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { Input } from "./Input"
import Percentage from "assets/icons/Percentage.svg?react"
import IconSearch from "assets/icons/IconSearch.svg?react"

export default {
  component: Input,
} as Meta<typeof Input>

type Story = StoryObj<typeof Input>

const Template = (props: ComponentPropsWithoutRef<typeof Input>) => {
  const [value, setValue] = useState("12.34")
  return (
    <TooltipProvider>
      <Input
        {...props}
        value={value}
        onChange={setValue}
        name="amount"
        label="Amount"
        withLabel
      />
    </TooltipProvider>
  )
}

export const Default: Story = {
  render: Template,
}

export const WithUnit: Story = {
  render: Template,
  args: {
    unit: "HDX",
  },
}

export const WithError: Story = {
  render: Template,
  args: {
    unit: "HDX",
    error: "Insufficient funds",
  },
}

export const WithPlaceholder: Story = {
  render: Template,
  args: {
    placeholder: "00.00",
  },
}

export const WithTooltip: Story = {
  render: Template,
  args: {
    tooltip: "Enter amount to swap",
  },
}

export const WithIconStart: Story = {
  render: Template,
  args: {
    iconStart: <IconSearch />,
  },
}

export const WithIconEnd: Story = {
  render: Template,
  args: {
    iconEnd: <Percentage />,
  },
}
