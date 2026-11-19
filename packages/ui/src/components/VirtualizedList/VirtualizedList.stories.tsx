import type { Meta, StoryObj } from "@storybook/react-vite"

import { CheckIcon, XIcon } from "@/assets/icons"
import { Flex } from "@/components/Flex"
import { Paper } from "@/components/Paper"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

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

const groupedItems = Array.from({ length: 20 }).flatMap((_, group) => [
  { name: `Group ${group}`, header: true },
  ...Array.from({ length: 8 }).map((_, i) => ({
    name: `Item ${group}.${i}`,
    header: false,
  })),
])

export const StickyGroups: Story = {
  render: () => (
    <Paper width={400} p="base">
      <VirtualizedList
        items={groupedItems}
        height={400}
        itemSize={(item) => (item.header ? 32 : 48)}
        isItemSticky={(item) => item.header}
        renderItem={(item) =>
          item.header ? (
            <Flex
              align="center"
              px="base"
              height="100%"
              sx={{ bg: getToken("surfaces.themeBasePalette.surfaceHigh") }}
            >
              <Text fs="p5" fw={500}>
                {item.name}
              </Text>
            </Flex>
          ) : (
            <Flex align="center" p="base" height="100%">
              {item.name}
            </Flex>
          )
        }
      />
    </Paper>
  ),
}
