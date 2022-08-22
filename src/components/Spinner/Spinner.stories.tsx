import { ComponentMeta, ComponentStory } from "@storybook/react"
import styled from "styled-components"
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
      <SpinnerComponent width={100} height={100} />
    </StyledContainer>
  )
}

export const Spinner = Template.bind({})
