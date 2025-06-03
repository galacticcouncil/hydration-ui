import { Meta, StoryObj } from "@storybook/react"
import { Download, Search } from "lucide-react"
import { useState } from "react"
import { NumberFormatValues } from "react-number-format"

import { Box } from "@/components"

import { Input } from "./Input"
import { NumberInput } from "./NumberInput"

type Story = StoryObj<typeof Input>

export default {
  component: Input,
} satisfies Meta<typeof Input>

const placeholder = "Search tokens..."

const Template = (args: React.ComponentPropsWithoutRef<typeof Input>) => (
  <Box maxWidth={400}>
    <Input {...args} />
  </Box>
)

export const Default: Story = {
  render: Template,
  args: {
    placeholder,
  },
}

export const Small: Story = {
  render: Template,
  args: {
    placeholder,
    customSize: "small",
  },
}

export const Large: Story = {
  render: Template,
  args: {
    placeholder,
    customSize: "large",
  },
}

export const IconStart: Story = {
  render: Template,
  args: {
    placeholder,
    iconStart: Search,
    customSize: "large",
  },
}

export const IconEnd: Story = {
  render: Template,
  args: {
    placeholder,
    iconEnd: Download,
    customSize: "large",
  },
}

export const Unit: Story = {
  render: Template,
  args: {
    placeholder,
    unit: "HDX",
    customSize: "large",
  },
}

export const Disabled: Story = {
  render: Template,
  args: {
    placeholder,
    disabled: true,
  },
}

export const Embedded: Story = {
  render: Template,
  args: {
    placeholder,
    variant: "embedded",
  },
}

export const EmbeddedDisalbed: Story = {
  render: Template,
  args: {
    placeholder,
    disabled: true,
    variant: "embedded",
  },
}

export const Numeric: Story = {
  render: () => {
    const [state, setState] = useState<NumberFormatValues | null>(null)
    return (
      <>
        <NumberInput
          customSize="large"
          placeholder="Enter a number"
          unit="HDX"
          onValueChange={setState}
        />
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </>
    )
  },
}
