import { Meta, StoryObj } from "@storybook/react"

import { Flex } from "@/components/Flex"

import { Grid } from "./Grid"

type Story = StoryObj<typeof Grid>

export default {
  component: Grid,
} satisfies Meta<typeof Grid>
const Template = (args: Story["args"]) => {
  return (
    <Grid gap="xl" {...args}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Flex
          key={i}
          p="xxxl"
          align="center"
          justify="center"
          bg="skyBlue.600"
          color="white"
          borderRadius="m"
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

export const ColumnTemplate: Story = {
  render: Template,
  args: {
    columnTemplate: "1fr 2fr 3fr 4fr",
  },
}

export const RowTemplate: Story = {
  render: Template,
  args: {
    columnTemplate: "repeat(4, 1fr)",
    rowTemplate: "100px 200px 400px",
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
