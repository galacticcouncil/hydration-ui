import { TooltipProvider } from "@radix-ui/react-tooltip"
import type { Meta, StoryObj } from "@storybook/react"
import { DataValue } from "./DataValue"
import { DataValueList } from "./DataValueList"
import { ComponentPropsWithoutRef } from "react"

type Story = StoryObj<typeof DataValue>

export default {
  component: DataValue,
} as Meta<typeof DataValue>

const Template = (props: ComponentPropsWithoutRef<typeof DataValue>) => (
  <DataValue {...props} label="Total Balance">
    $129 851
  </DataValue>
)

export const Default: Story = {
  render: Template,
}

export const Small: Story = {
  render: Template,
  args: {
    size: "small",
  },
}

export const Medium: Story = {
  render: Template,
  args: {
    size: "medium",
  },
}

export const Large: Story = {
  render: Template,
  args: {
    size: "large",
  },
}

export const ExtraLarge: Story = {
  render: Template,
  args: {
    size: "extra-large",
  },
}

export const RegularFont: Story = {
  render: Template,
  args: {
    font: "Geist",
  },
}

export const LabelColor: Story = {
  render: Template,
  args: {
    labelColor: "brightBlue300",
  },
}

export const WithTooltip: Story = {
  render: (args) => (
    <TooltipProvider>
      <Template {...args} />
    </TooltipProvider>
  ),
  args: {
    labelColor: "brightBlue300",
    tooltip: "Your total account balance.",
  },
}

export const List = {
  render: () => (
    <DataValueList>
      <DataValue labelColor="brightBlue300" label="Total Balance">
        $129 851
      </DataValue>
      <DataValue labelColor="brightBlue300" label="Assets Balance">
        $129 000
      </DataValue>
      <DataValue labelColor="brightBlue300" label="Liquidity Balance">
        $851
      </DataValue>
    </DataValueList>
  ),
}

export const ListSeparated = {
  render: () => (
    <DataValueList separated>
      <DataValue labelColor="brightBlue300" label="Total Balance">
        $129 851
      </DataValue>
      <DataValue labelColor="brightBlue300" label="Assets Balance">
        $129 000
      </DataValue>
      <DataValue labelColor="brightBlue300" label="Liquidity Balance">
        $851
      </DataValue>
    </DataValueList>
  ),
}
