import type { StoryObj } from "@storybook/react"

import { Button } from "@/components/Button"

import { CopyButton } from "./CopyButton"

export default { component: CopyButton }

type Story = StoryObj<typeof CopyButton>

const Template = (args: Story["args"]) => (
  <CopyButton
    text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    {...args}
  />
)

export const DefaultWithReset: Story = {
  render: Template,
}

export const WithoutReset: Story = {
  render: Template,
  args: {
    delay: 0,
  },
}

export const AsStyledButton: Story = {
  render: () => (
    <Button asChild size="large">
      <Template />
    </Button>
  ),
}
