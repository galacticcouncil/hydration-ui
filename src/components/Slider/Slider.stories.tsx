import { Slider as SliderComponent } from "components/Slider/Slider"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { useState } from "react"
import styled from "@emotion/styled"

export default {
  title: "components/Slider",
  component: SliderComponent,
} as ComponentMeta<typeof SliderComponent>

const SContainer = styled.div`
  width: 300px;
  height: 200px;
`

const Template: ComponentStory<typeof SliderComponent> = (args) => {
  const [value, setValue] = useState(25)

  const onChange = (values: number[]) => {
    setValue(values[0])
  }

  return (
    <SContainer>
      <SliderComponent {...args} value={[value]} onChange={onChange} />
    </SContainer>
  )
}

export const Slider = Template.bind({})
Slider.args = {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
}
