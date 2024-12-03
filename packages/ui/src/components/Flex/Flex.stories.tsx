import { Meta, StoryObj } from "@storybook/react"

import { Flex } from "./Flex"

type Story = StoryObj<typeof Flex>

export default {
  component: Flex,
} satisfies Meta<typeof Flex>
const Template = (args: Story["args"]) => {
  const hasAlign = !!args?.align
  return (
    <Flex gap={20} {...args}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Flex
          key={i}
          size={hasAlign ? 80 - i * 12 : 80}
          align="center"
          justify="center"
          bg="skyBlue.600"
          color="white"
          borderRadius="lg"
        >
          {i + 1}
        </Flex>
      ))}
    </Flex>
  )
}

export const Default: Story = {
  render: Template,
}

export const JustifyBetween: Story = {
  render: Template,
  args: {
    justify: "space-between",
  },
}

export const JustifyAround: Story = {
  render: Template,
  args: {
    justify: "space-around",
  },
}

export const JustifyFlexEnd: Story = {
  render: Template,
  args: {
    justify: "flex-end",
  },
}

export const AlignStart: Story = {
  render: Template,
  args: {
    align: "start",
  },
}

export const AlignCenter: Story = {
  render: Template,
  args: {
    align: "center",
  },
}

export const AlignEnd: Story = {
  render: Template,
  args: {
    align: "end",
  },
}

export const DirectionColumn: Story = {
  render: Template,
  args: {
    direction: "column",
  },
}

export const Responsive: Story = {
  render: Template,
  args: {
    gap: [5, null, 30],
    direction: ["column", null, "row"],
  },
}
