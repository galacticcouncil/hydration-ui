import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { keys } from "remeda"

import { LOGO_SIZES } from "@/components/Logo/Logo.styled"
import { Stack } from "@/components/Stack"

import { Logo } from "./Logo"

type Story = StoryObj<typeof Logo>

export default {
  component: Logo,
} satisfies Meta<typeof Logo>

const VALID_IMAGE_URL =
  "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png"
const INVALID_IMAGE_URL = "https://invalid-url-that-will-fail.com/image.jpg"

const Template = (args: React.ComponentPropsWithoutRef<typeof Logo>) => (
  <Stack gap="xl">
    {keys(LOGO_SIZES).map((size) => (
      <Logo key={size} {...args} size={size} />
    ))}
  </Stack>
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
  },
}
