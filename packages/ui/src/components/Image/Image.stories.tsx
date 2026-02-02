import type { Meta, StoryObj } from "@storybook/react-vite"
import React from "react"

import { Flex } from "@/components/Flex"

import { Image } from "./Image"

type Story = StoryObj<typeof Image>

export default {
  component: Image,
} satisfies Meta<typeof Image>

const VALID_IMAGE_URL = "https://picsum.photos/500/500"
const INVALID_IMAGE_URL = "https://invalid-url-that-will-fail.com/image.jpg"

const PlaceholderComponent = () => (
  <Flex
    align="center"
    justify="center"
    borderColor="#ccc"
    borderWidth={2}
    borderStyle="dashed"
    width="100%"
    height="100%"
  >
    Image failed to load
  </Flex>
)

const Template = (args: React.ComponentPropsWithoutRef<typeof Image>) => (
  <Image {...args} width={200} height={200} />
)

export const Default: Story = {
  render: Template,
  args: {
    src: VALID_IMAGE_URL,
  },
}

export const WithPlaceholder: Story = {
  render: Template,
  args: {
    src: INVALID_IMAGE_URL,
    placeholder: <PlaceholderComponent />,
  },
}
