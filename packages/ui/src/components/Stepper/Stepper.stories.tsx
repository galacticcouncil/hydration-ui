import { TooltipProvider } from "@radix-ui/react-tooltip"
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
  const stepCount = args.steps.length
  const totalSteps = Math.max(stepCount, 1)

  return (
    <TooltipProvider delayDuration={0}>
      <Flex direction="column" gap="xl">
        <Stepper {...args} activeStepIndex={activeStepIndex} />
        <Flex gap="base" justify="space-between" mt="xl">
          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              setActiveStepIndex((prev) => (prev - 1 + totalSteps) % totalSteps)
            }
            disabled={activeStepIndex === 0 || stepCount === 0}
          >
            Previous
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() =>
              setActiveStepIndex((prev) => (prev + 1) % totalSteps)
            }
            disabled={activeStepIndex === stepCount - 1 || stepCount === 0}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </TooltipProvider>
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

export const Compact: Story = {
  render: Template,
  args: {
    steps: STEPS,
    activeStepIndex: 0,
    compact: true,
  },
}
