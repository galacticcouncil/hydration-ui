import { Meta, StoryObj } from "@storybook/react-vite"

import { Box } from "@/components/Box"
import { Separator } from "@/components/Separator"

import { Stack } from "./Stack"

type Story = StoryObj<typeof Stack>

export default {
  component: Stack,
} satisfies Meta<typeof Stack>

const Template = (args: Story["args"]) => (
  <Stack {...args}>
    <Box size="l" bg="hotpink" />
    <Box size="l" bg="hotpink" />
    <Box size="l" bg="hotpink" />
    <Box size="l" bg="hotpink" />
    <Box size="l" bg="hotpink" />
  </Stack>
)

export const Column: Story = {
  render: Template,
  args: {
    direction: "column",
    gap: 20,
  },
}

export const Row: Story = {
  render: Template,
  args: {
    direction: "row",
    gap: 20,
  },
}

export const ColumnWithSeparator: Story = {
  render: Template,
  args: {
    direction: "column",
    separated: true,
    gap: 20,
  },
}

export const RowWithSeparator: Story = {
  render: Template,
  args: {
    direction: "row",
    separated: true,
    gap: 20,
  },
}

export const CustomSeparator: Story = {
  render: Template,
  args: {
    direction: "column",
    separated: true,
    separator: <Separator size={5} sx={{ bg: "hotpink" }} />,
    gap: 20,
  },
}

export const Responsive: Story = {
  render: Template,
  args: {
    direction: ["column", null, "row"],
    separated: true,
    separator: <Separator size={5} sx={{ bg: "hotpink" }} />,
    gap: 20,
  },
}
