import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@/components/Button"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard"

type Story = StoryObj<typeof HoverCard>

export default {
  component: HoverCard,
} satisfies Meta<typeof HoverCard>

const Template = (args: Story["args"]) => (
  <HoverCard {...args}>
    <HoverCardTrigger asChild>
      <Button>Hover me</Button>
    </HoverCardTrigger>
    <HoverCardContent maxWidth={320}>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Et sint commodi
      quasi totam fugiat reprehenderit pariatur nemo, vel distinctio doloribus
      magni quibusdam, expedita voluptatibus nihil tempora blanditiis quaerat
      aut qui?
    </HoverCardContent>
  </HoverCard>
)

export const Default: Story = {
  render: Template,
}
