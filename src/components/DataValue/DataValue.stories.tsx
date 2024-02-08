import { TooltipProvider } from "@radix-ui/react-tooltip"
import type { Meta, StoryObj } from "@storybook/react"
import { DataValueList } from "components/DataValue/DataValue.styled"
import { DataValue } from "./DataValue"

type Story = StoryObj<typeof DataValue>

export default {
  component: DataValue,
} as Meta<typeof DataValue>

export const Default: Story = {
  render: () => <DataValue label="Total Balance">$129 851</DataValue>,
}

export const Small: Story = {
  render: () => (
    <DataValue size="small" label="Total Balance">
      $129 851
    </DataValue>
  ),
}

export const Medium: Story = {
  render: () => (
    <DataValue size="medium" label="Total Balance">
      $129 851
    </DataValue>
  ),
}

export const Large: Story = {
  render: () => (
    <DataValue size="large" label="Total Balance">
      $129 851
    </DataValue>
  ),
}

export const RegularFont: Story = {
  render: () => (
    <DataValue font="ChakraPetch" label="Total Balance">
      $129 851
    </DataValue>
  ),
}

export const LabelColor: Story = {
  render: () => (
    <DataValue labelColor="brightBlue300" label="Total Balance">
      $129 851
    </DataValue>
  ),
}

export const WithTooltip: Story = {
  render: () => (
    <TooltipProvider>
      <DataValue
        labelColor="brightBlue300"
        label="Total Balance"
        tooltip="Your total account balance."
      >
        $129 851
      </DataValue>
    </TooltipProvider>
  ),
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
