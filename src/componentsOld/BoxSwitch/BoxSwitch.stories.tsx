import { BoxSwitch as BoxSwitchComponent } from "components/BoxSwitch/BoxSwitch"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import React, { useState } from "react"

export default {
  title: "components/Switch/BoxSwitch",
  component: BoxSwitchComponent,
} as ComponentMeta<typeof BoxSwitchComponent>

const options = [
  { label: "24%", value: 24 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "MAX", value: 100 },
] as { label: string; value: number }[]

const Template: ComponentStory<typeof BoxSwitchComponent> = (args) => {
  const [value, setValue] = useState(options[1].value)

  return <BoxSwitchComponent {...args} selected={value} onSelect={setValue} />
}

export const BoxSwitch = Template.bind({})
BoxSwitch.args = {
  options,
}
