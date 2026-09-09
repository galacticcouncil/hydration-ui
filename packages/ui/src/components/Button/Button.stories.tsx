import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Flex } from "@/components"

import { Button, LoadingButton } from "./Button"

type Story = StoryObj<typeof Button>

export default {
  component: Button,
} satisfies Meta<typeof Button>

const Template = (args: Story["args"]) => <Button {...args}>Button</Button>

const VariantTemplate = (args: Story["args"]) => (
  <Flex direction="column" gap="xl">
    <Flex align="center" gap="xl">
      <Button {...args} size="large">
        Button
      </Button>
      <Button {...args} size="medium">
        Button
      </Button>
      <Button {...args} size="small">
        Button
      </Button>
    </Flex>
    <Flex align="center" gap="xl">
      <Button {...args} outline size="large">
        Button
      </Button>
      <Button {...args} outline size="medium">
        Button
      </Button>
      <Button {...args} outline size="small">
        Button
      </Button>
    </Flex>
    <Flex align="center" gap="xl">
      <Button {...args} outline glow size="large">
        Button
      </Button>
      <Button {...args} outline glow size="medium">
        Button
      </Button>
      <Button {...args} outline glow size="small">
        Button
      </Button>
    </Flex>
  </Flex>
)

export const Default: Story = {
  render: Template,
}

export const Disabled: Story = {
  render: Template,
  args: {
    disabled: true,
  },
}

export const Primary: Story = {
  render: VariantTemplate,
  args: {
    variant: "primary",
  },
}

export const Secondary: Story = {
  render: VariantTemplate,
  args: {
    variant: "secondary",
  },
}

export const Tertiary: Story = {
  render: VariantTemplate,
  args: {
    variant: "tertiary",
  },
}

export const Success: Story = {
  render: VariantTemplate,
  args: {
    variant: "success",
  },
}

export const Danger: Story = {
  render: VariantTemplate,
  args: {
    variant: "danger",
  },
}

export const Emphasis: Story = {
  render: VariantTemplate,
  args: {
    variant: "emphasis",
  },
}

export const Accent: Story = {
  render: VariantTemplate,
  args: {
    variant: "accent",
  },
}

export const Muted: Story = {
  render: VariantTemplate,
  args: {
    variant: "muted",
  },
}

export const Transparent: Story = {
  render: VariantTemplate,
  args: {
    variant: "transparent",
  },
}

const LoadingTemplate = () => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Flex direction="column" gap="xl" align="start">
      <Button
        variant="tertiary"
        onClick={() => setIsLoading((value) => !value)}
      >
        Toggle loading
      </Button>
      <LoadingButton isLoading={isLoading} size="large" width={300}>
        Sign Transaction
      </LoadingButton>
      <LoadingButton
        isLoading={isLoading}
        loadingMode="replace"
        size="large"
        width={300}
      >
        Sign Transaction
      </LoadingButton>
      <LoadingButton isLoading={isLoading}>Load all (42)</LoadingButton>
      <LoadingButton isLoading={isLoading} loadingMode="replace">
        Load all (42)
      </LoadingButton>
    </Flex>
  )
}

export const Loading: StoryObj<typeof LoadingButton> = {
  render: LoadingTemplate,
}
