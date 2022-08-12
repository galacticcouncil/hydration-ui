import { BoxSwitch as BoxSwitchComponent } from "components/BoxSwitch/BoxSwitch"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import React, { useState } from "react"
import styled from "styled-components/macro"
import SatoshiVariable from "assets/fonts/SatoshiVariable.ttf"

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

const StyledContainer = styled.div`
  // TODO: remove font styles and move to some global storybook config
  @font-face {
    font-family: "SatoshiVariable";
    src: local("SatoshiVariable"), url(${SatoshiVariable}) format("truetype");
    font-display: swap;
    font-weight: 100 900;
  }

  font-family: "SatoshiVariable", sans-serif;
`

const Template: ComponentStory<typeof BoxSwitchComponent> = (args) => {
  const [value, setValue] = useState(options[1].value)

  return (
    <StyledContainer>
      <BoxSwitchComponent {...args} selected={value} onSelect={setValue} />
    </StyledContainer>
  )
}

export const BoxSwitch = Template.bind({})
BoxSwitch.args = {
  options,
}
