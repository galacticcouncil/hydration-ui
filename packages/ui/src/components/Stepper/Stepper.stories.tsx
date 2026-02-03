import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Flex } from "@/components"
import { Button } from "@/components/Button"

import { Stepper } from "./Stepper"

type Story = StoryObj<typeof Stepper>

export default {
  component: Stepper,
} satisfies Meta<typeof Stepper>

const STEPS = [
  "Set fee payment asset",
  "Remove from Stablepool",
  "Remove from Omnipool",
]

const Template = (args: React.ComponentPropsWithoutRef<typeof Stepper>) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const totalSteps = args.steps.length + 1

  return (
    <Flex direction="column" gap="xl">
      <Stepper {...args} activeStepIndex={activeStepIndex} />
      <Flex gap="base" justify="space-between" mt="xl">
        <Button
          size="small"
          variant="secondary"
          onClick={() => setActiveStepIndex((prev) => (prev - 1) % totalSteps)}
          disabled={activeStepIndex === 0}
        >
          Previous
        </Button>
        <Button
          size="small"
          variant="secondary"
          onClick={() => setActiveStepIndex((prev) => (prev + 1) % totalSteps)}
          disabled={activeStepIndex === totalSteps - 1}
        >
          Next
        </Button>
      </Flex>
    </Flex>
  )
}

export const Default: Story = {
  render: Template,
  args: {
    steps: STEPS,
    activeStepIndex: 0,
  },
}

export const CustomWidth: Story = {
  render: Template,
  args: {
    steps: STEPS,
    activeStepIndex: 0,
    maxWidth: 500,
  },
}
