import { Meta, StoryObj } from "@storybook/react"
import { Download, Search } from "lucide-react"

import { Box } from "@/components/Box"

import { Input } from "./Input"

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

export const IconComponent: Story = {
  render: Template,
  args: {
    placeholder,
    iconEnd: (props) => (
      <span {...props} sx={{ fontWeight: 500, fontSize: 14 }}>
        HDX
      </span>
    ),
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
