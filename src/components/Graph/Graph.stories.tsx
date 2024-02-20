import styled from "@emotion/styled"
import { Meta, StoryObj } from "@storybook/react"
import { ComponentPropsWithoutRef } from "react"
import { Graph as GraphComponent } from "./Graph"

type Story = StoryObj<typeof GraphComponent>

export default {
  component: GraphComponent,
} as Meta<typeof GraphComponent>

const data = Array.from({ length: 80 }).map((_, i) => ({
  x: i,
  y: Math.log(i + 1) * 20,
  currentLoyalty: false,
}))

const SContainer = styled.div`
  width: 500px;
  height: 300px;
`

const Template = (props: ComponentPropsWithoutRef<typeof GraphComponent>) => (
  <SContainer>
    <GraphComponent {...props} />
  </SContainer>
)

export const Graph: Story = {
  render: Template,
  args: {
    labelX: "Days",
    labelY: "Rewards APR %",
    data,
  },
}
