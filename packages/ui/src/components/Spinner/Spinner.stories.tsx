import type { Meta, StoryObj } from "@storybook/react-vite"

import { Flex } from "@/components"

import { Spinner } from "./Spinner"

type Story = StoryObj<typeof Spinner>

export default {
  component: Spinner,
} satisfies Meta<typeof Spinner>

const Template = (args: Story["args"]) => <Spinner {...args} />

const SizesTemplate = (args: Story["args"]) => (
  <Flex align="center" gap="xl">
    <Spinner {...args} size="l" />
    <Spinner {...args} size="xl" />
    <Spinner {...args} size="2xl" />
    <Spinner {...args} size="3xl" />
  </Flex>
)

export const Default: Story = {
  render: Template,
}

export const Sizes: Story = {
  render: SizesTemplate,
}
