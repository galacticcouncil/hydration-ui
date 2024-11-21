import { Meta, StoryObj } from "@storybook/react"

import { Flex } from "@/components/Flex"

import { Grid } from "./Grid"

type Story = StoryObj<typeof Grid>

export default {
  component: Grid,
} satisfies Meta<typeof Grid>
const Template = (args: Story["args"]) => {
  return (
    <Grid gap={20} {...args}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Flex
          key={i}
          p={30}
          align="center"
          justify="center"
          bg="sky-blue.600"
          color="white"
          borderRadius="lg"
        >
          {i + 1}
        </Flex>
      ))}
    </Grid>
  )
}

export const Default: Story = {
  render: Template,
}

export const ColumnCount: Story = {
  render: Template,
  args: {
    columns: 3,
  },
}

export const ColumnFitWidth: Story = {
  render: Template,
  args: {
    columnWidth: [100],
  },
}

export const ColumnFillWidth: Story = {
  render: Template,
  args: {
    columnWidth: [100],
    repeat: "fill",
  },
}

export const Responsive: Story = {
  render: Template,
  args: {
    columns: [1, 2, 3, 4],
  },
}
