import type { Meta, StoryObj } from "@storybook/react"

import { CheckIcon, XIcon } from "@/assets/icons"
import { Flex } from "@/components/Flex"
import { Paper } from "@/components/Paper"

import { VirtualizedList } from "./VirtualizedList"

type Story = StoryObj<typeof VirtualizedList>

export default {
  component: VirtualizedList,
} satisfies Meta<typeof VirtualizedList>

const items = Array.from({ length: 1000 }).map((_, i) => ({
  name: `Item ${i}`,
  checked: i % 3 === 0,
}))

const Template = (
  args: React.ComponentPropsWithoutRef<typeof VirtualizedList>,
) => (
  <Paper width={400} p="base">
    <VirtualizedList
      {...args}
      items={items}
      height={400}
      itemSize={36}
      renderItem={(item) => (
        <Flex align="center" gap="base" p="base">
          {item.checked ? (
            <CheckIcon sx={{ color: "lime" }} />
          ) : (
            <XIcon sx={{ color: "red" }} />
          )}
          {item.name}
        </Flex>
      )}
    />
  </Paper>
)

export const Default: Story = {
  render: Template,
}
export const WithInitialScrollIndex: Story = {
  render: Template,
  args: {
    initialScrollIndex: 500,
  },
}
