import type { Meta, StoryObj } from "@storybook/react"

import { Paper } from "./Paper"

type Story = StoryObj<typeof Paper>

export default {
  component: Paper,
} satisfies Meta<typeof Paper>

const Template = (args: Story["args"]) => (
  <Paper {...args} width={500} p={20}>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam a natus itaque
    corrupti perferendis fuga eligendi provident dolore fugiat, vitae
    laboriosam. Quasi culpa maxime eaque ipsum porro neque a fugit.
  </Paper>
)

export const Default: Story = {
  render: Template,
}
