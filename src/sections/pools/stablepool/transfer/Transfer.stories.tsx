import { ComponentMeta, ComponentStory } from "@storybook/react"
import { TransferOptions } from "./TransferOptions"

export default {
  title: "stablepool/Transfer",
  component: TransferOptions,
} as ComponentMeta<typeof TransferOptions>

const Template: ComponentStory<typeof TransferOptions> = () => {
  return <TransferOptions />
}

export const TransferOptionsStory = Template.bind({})
