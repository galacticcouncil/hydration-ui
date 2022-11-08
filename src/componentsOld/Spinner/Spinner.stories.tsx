import { ComponentMeta, ComponentStory } from "@storybook/react"
import styled from "@emotion/styled"
import { Spinner as SpinnerComponent } from "./Spinner.styled"

export default {
  title: "components/Spinner",
  component: SpinnerComponent,
} as ComponentMeta<typeof SpinnerComponent>

const SContainer = styled.div`
  width: 300px;
  height: 200px;
`

const Template: ComponentStory<typeof SpinnerComponent> = (args) => {
  return (
    <SContainer>
      <SpinnerComponent width={100} height={100} />
    </SContainer>
  )
}

export const Spinner = Template.bind({})
