import { Meta, StoryObj } from "@storybook/react"
import styled from "@emotion/styled"
import { Spinner as SpinnerComponent } from "./Spinner.styled"

type Story = StoryObj<typeof SpinnerComponent>

export default {
  title: "components/Spinner",
  component: SpinnerComponent,
} as Meta<typeof SpinnerComponent>

const SContainer = styled.div`
  width: 300px;
  height: 200px;
`

const Template = () => {
  return (
    <SContainer>
      <SpinnerComponent width={100} height={100} />
    </SContainer>
  )
}

export const Spinner: Story = {
  render: Template,
}
