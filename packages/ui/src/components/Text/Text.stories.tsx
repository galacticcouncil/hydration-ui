import type { Meta, StoryObj } from "@storybook/react-vite"

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
    font: "primary",
    fw: 400,
  },
}

export const PrimaryMedium: Story = {
  args: {
    children: PANGRAM,
    font: "primary",
    fw: 500,
  },
}

export const PrimaryBold: Story = {
  args: {
    children: PANGRAM,
    font: "primary",
    fw: 600,
  },
}

export const SecondaryRegular: Story = {
  args: {
    children: PANGRAM,
    font: "secondary",
    fw: 400,
  },
}

export const SecondaryMedium: Story = {
  args: {
    children: PANGRAM,
    font: "secondary",
    fw: 500,
  },
}

export const SecondaryBold: Story = {
  args: {
    children: PANGRAM,
    font: "secondary",
    fw: 600,
  },
}

export const Responsive: Story = {
  args: {
    children: PANGRAM,
    font: "secondary",
    fw: [400, 500, 600],
    fs: [14, 22, 30],
  },
}

export const Colors: Story = {
  render: (args) => (
    <>
      <Text {...args} color="coral.700">
        {PANGRAM}
      </Text>
      <Text {...args} color="utility.warningPrimary.300">
        {PANGRAM}
      </Text>
      <Text {...args} color="skyBlue.600">
        {PANGRAM}
      </Text>
      <Text {...args} color="successGreen.400">
        {PANGRAM}
      </Text>
    </>
  ),
  args: {
    children: PANGRAM,
    fs: 40,
    fw: 600,
  },
}
