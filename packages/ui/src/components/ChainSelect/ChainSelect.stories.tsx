import { Meta, StoryFn } from "@storybook/react"

import { Flex } from "@/components/Flex"

import { ChainSelect } from "./ChainSelect"

export default {
  component: ChainSelect,
} satisfies Meta<typeof ChainSelect>

export const ChainSelectStory: StoryFn = () => {
  return (
    <Flex direction="column" gap={10}>
      <Flex gap={10}>
        <ChainSelect variant="desktop">Assethub</ChainSelect>
        <ChainSelect variant="desktop" disabled>
          Assethub
        </ChainSelect>
        <ChainSelect variant="desktop" isActive>
          Pendulum
        </ChainSelect>
      </Flex>
      <Flex gap={10}>
        <ChainSelect variant="mobile">Assethub</ChainSelect>
        <ChainSelect variant="mobile" isActive>
          Pendulum
        </ChainSelect>
      </Flex>

      <Flex gap={10}>
        <ChainSelect variant="mobile-compact">Assethub</ChainSelect>
        <ChainSelect variant="mobile-compact" isActive>
          Pendulum
        </ChainSelect>
      </Flex>
    </Flex>
  )
}
