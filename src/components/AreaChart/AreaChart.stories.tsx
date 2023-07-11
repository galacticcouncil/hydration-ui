import { ComponentMeta, ComponentStory } from "@storybook/react"
import { AreaChart } from "./AreaChart"

export default {
  title: "components/AreaChart",
  component: AreaChart,
} as ComponentMeta<typeof AreaChart>


const Template: ComponentStory<typeof AreaChart> = () => (
  <AreaChart />
)

export const AreaChartStory = Template.bind({})
// AreaChartStory.args = {}
