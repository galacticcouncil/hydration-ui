import { Meta, StoryFn } from "@storybook/react-vite"

import { Button } from "@/components/Button"

import { Collapsible } from "./Collapsible"

export default {
  component: Collapsible,
} satisfies Meta<typeof Collapsible>

type Story = StoryFn<typeof Collapsible>

export const Default: Story = () => {
  return (
    <Collapsible
      label="Collapsible"
      actionLabel="Open"
      actionLabelWhenOpen="Close"
    >
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos enim
      quia ex provident aut explicabo voluptatem totam suscipit perferendis,
      reprehenderit quo modi repudiandae illo voluptas repellendus repellat
      sequi a asperiores?
    </Collapsible>
  )
}

export const InitiallyOpen: Story = () => {
  return (
    <Collapsible
      label="Collapsible"
      actionLabel="Open"
      actionLabelWhenOpen="Close"
      defaultOpen
    >
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos enim
      quia ex provident aut explicabo voluptatem totam suscipit perferendis,
      reprehenderit quo modi repudiandae illo voluptas repellendus repellat
      sequi a asperiores?
    </Collapsible>
  )
}

export const CustomTrigger: Story = () => {
  return (
    <Collapsible trigger={<Button>open</Button>}>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos enim
      quia ex provident aut explicabo voluptatem totam suscipit perferendis,
      reprehenderit quo modi repudiandae illo voluptas repellendus repellat
      sequi a asperiores?
    </Collapsible>
  )
}
