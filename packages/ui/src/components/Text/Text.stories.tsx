import type { Meta, StoryObj } from "@storybook/react"

import { Text } from "./Text"

type Story = StoryObj<typeof Text>

export default {
  component: Text,
} satisfies Meta<typeof Text>

const PANGRAM = "The quick brown fox jumps over the lazy dog"

export const Default: Story = {
  args: {
    children: PANGRAM,
  },
}

export const PrimaryRegular: Story = {
  args: {
    children: PANGRAM,
    font: "Primary-Font",
    fw: 400,
  },
}

export const PrimaryMedium: Story = {
  args: {
    children: PANGRAM,
    font: "Primary-Font",
    fw: 500,
  },
}

export const PrimaryBold: Story = {
  args: {
    children: PANGRAM,
    font: "Primary-Font",
    fw: 600,
  },
}

export const SecondaryRegular: Story = {
  args: {
    children: PANGRAM,
    font: "Secondary",
    fw: 400,
  },
}

export const SecondaryMedium: Story = {
  args: {
    children: PANGRAM,
    font: "Secondary",
    fw: 500,
  },
}

export const SecondaryBold: Story = {
  args: {
    children: PANGRAM,
    font: "Secondary",
    fw: 600,
  },
}
