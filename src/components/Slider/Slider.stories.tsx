import { Slider as SliderComponent } from "components/Slider/Slider"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { useState } from "react"
import styled from "styled-components"

export default {
  title: "components/Slider",
  component: SliderComponent,
} as ComponentMeta<typeof SliderComponent>

const StyledContainer = styled.div`
  width: 300px;
  height: 200px;
`

const Template: ComponentStory<typeof SliderComponent> = (args) => {
  const [value, setValue] = useState(25)

  const onChange = (values: number[]) => {
    setValue(values[0])
  }

  return (
    <StyledContainer>
      <SliderComponent {...args} value={[value]} onChange={onChange} />
    </StyledContainer>
  )
}

export const Slider = Template.bind({})
Slider.args = {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
}
