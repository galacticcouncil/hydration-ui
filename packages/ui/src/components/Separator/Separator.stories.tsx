import type { Meta, StoryObj } from "@storybook/react"

import { Flex } from "@/components/Flex"

import { Separator } from "./Separator"

type Story = StoryObj<typeof Separator>

export default {
  component: Separator,
} satisfies Meta<typeof Separator>

export const Horizontal: Story = {
  render: () => (
    <Flex direction="column" gap="xl">
      Lorem ipsum dolor sit amet consectetur adipisicing elit.
      <Separator />
      Culpa, deleniti ad optio sunt eum soluta aspernatur libero error a dolor
      earum.
      <Separator />
      Iusto deserunt veniam nostrum dolorem assumenda excepturi amet nemo.
    </Flex>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Flex gap="xl" width={800} height={100} align="center">
      Lorem ipsum dolor sit amet consectetur adipisicing elit.
      <Separator orientation="vertical" sx={{ height: 50 }} />
      Culpa, deleniti ad optio sunt eum soluta aspernatur libero error a dolor
      earum.
      <Separator orientation="vertical" sx={{ height: 50 }} />
      Iusto deserunt veniam nostrum dolorem assumenda excepturi amet nemo.
    </Flex>
  ),
}
