import { Meta, StoryObj } from "@storybook/react-vite"

import { Separator, Stack } from "@/components"

import { StepTrigger } from "./StepTrigger"

type Story = StoryObj<typeof StepTrigger>

export default {
  component: StepTrigger,
  args: {
    stepNumber: 1,
    title: "Signers",
    description: "Add the accounts that will sign transactions.",
    state: "active",
  },
} satisfies Meta<typeof StepTrigger>

export const Active: Story = {}

export const Done: Story = {
  args: {
    state: "done",
    description: "2 signers added",
  },
}

export const Todo: Story = {
  args: {
    stepNumber: 2,
    state: "todo",
    title: "Threshold",
    description: "Choose how many signers must approve.",
  },
}

export const AllStates: Story = {
  render: () => (
    <Stack>
      <StepTrigger
        stepNumber={1}
        state="done"
        title="Signers"
        description="2 signers added"
      />
      <Separator />
      <StepTrigger
        stepNumber={2}
        state="active"
        title="Threshold"
        description="Choose how many signers must approve."
      />
      <Separator />
      <StepTrigger
        stepNumber={3}
        state="todo"
        title="Name"
        description="Give your account a name."
      />
    </Stack>
  ),
}

export const LongDescription: Story = {
  args: {
    stepNumber: 2,
    state: "done",
    title: "Bank account",
    description: `DEMO-${"A".repeat(75)}`,
  },
  render: (args) => (
    <Stack width="100%" maxWidth={320}>
      <StepTrigger {...args} />
    </Stack>
  ),
}
