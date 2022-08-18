import { ComponentMeta, ComponentStory } from "@storybook/react"
import styled from "styled-components/macro"
import { Spinner as SpinnerComponent } from "./Spinner.styled"

export default {
  title: "components/Spinner",
  component: SpinnerComponent,
} as ComponentMeta<typeof SpinnerComponent>

const StyledContainer = styled.div`
  width: 300px;
  height: 200px;
`

const Template: ComponentStory<typeof SpinnerComponent> = (args) => {
  return (
    <StyledContainer>
      <SpinnerComponent />
    </StyledContainer>
  )
}

export const Spinner = Template.bind({})
