import { Meta, StoryObj } from "@storybook/react"

import { Flex } from "@/components/Flex"
import { Paper } from "@/components/Paper"

import { ScrollArea } from "./ScrollArea"

type Story = StoryObj<typeof ScrollArea>

export default {
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`,
)

const Template = (args: React.ComponentPropsWithoutRef<typeof ScrollArea>) => (
  <Paper p="base" height={400} width={400}>
    <ScrollArea {...args}>
      <Flex
        gap="s"
        direction={args.orientation === "horizontal" ? "row" : "column"}
      >
        {tags.map((tag) => (
          <span sx={{ whiteSpace: "nowrap" }} key={tag}>
            {tag}
          </span>
        ))}
      </Flex>
    </ScrollArea>
  </Paper>
)

export const Default: Story = {
  render: Template,
}

export const Horizontal: Story = {
  render: Template,
  args: {
    orientation: "horizontal",
  },
}

export const AlwaysVisible: Story = {
  render: Template,
  args: {
    type: "always",
  },
}
