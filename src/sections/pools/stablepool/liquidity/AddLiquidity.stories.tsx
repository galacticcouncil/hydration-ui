import { ComponentMeta, ComponentStory } from "@storybook/react"
import { AddLiquidity } from "./AddLiquidity"

export default {
  title: "components/AddLiquidity",
  component: AddLiquidity,
} as ComponentMeta<typeof AddLiquidity>

const Template: ComponentStory<typeof AddLiquidity> = () => {
  return <AddLiquidity />
}

export const AddLiquidityStory = Template.bind({})
