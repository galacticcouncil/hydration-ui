import type { Meta, StoryObj } from "@storybook/react"

import { Box, Flex, Text } from "@/components"

import { Skeleton } from "./Skeleton"

type Story = StoryObj<typeof Skeleton>

export default {
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

const Template = () => (
  <Box width={500}>
    <Text as="h1">
      <Skeleton />
    </Text>
    <Text>
      <Skeleton count={2} />
    </Text>
    <Flex gap={10} align="center" my={10}>
      <Skeleton circle width={50} height={50} />
      <Box sx={{ flex: 1 }}>
        <Text>
          <Skeleton count={2} />
        </Text>
      </Box>
    </Flex>
    <Text>
      <Skeleton count={10} />
    </Text>
  </Box>
)

export const Default: Story = {
  render: Template,
}
