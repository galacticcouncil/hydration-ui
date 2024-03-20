import { Meta, StoryObj } from "@storybook/react"
import styled from "@emotion/styled"
import { Spinner as SpinnerComponent } from "./Spinner"

type Story = StoryObj<typeof SpinnerComponent>

export default {
  component: SpinnerComponent,
} as Meta<typeof SpinnerComponent>

const SContainer = styled.div`
  width: 100%;
  height: 200px;

  display: flex;
  align-items: center;
  gap: 24px;
`

const Template = () => {
  return (
    <SContainer>
      <SpinnerComponent size={80} />
      <SpinnerComponent size={100} />
      <SpinnerComponent size={120} />
    </SContainer>
  )
}

export const Spinner: Story = {
  render: Template,
}
