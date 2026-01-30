import { Meta, StoryFn } from "@storybook/react-vite"

import { Combobox } from "@/components/Combobox/Combobox"

export default {
  component: Combobox,
} satisfies Meta<typeof Combobox>

export const ComboboxStory: StoryFn = () => {
  return (
    <Combobox
      items={[
        {
          key: "item-1",
          label: "Item 1",
        },
        {
          key: "item-2",
          label: "Item 2",
        },
        {
          key: "item-3",
          label: "Item 3",
        },
      ]}
      onSelectionChange={() => {}}
    />
  )
}
