import React from "react"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Graph as GraphComponent } from "./Graph"
import styled from "styled-components"

export default {
  title: "components/Graph",
  component: GraphComponent,
} as ComponentMeta<typeof GraphComponent>

const data = Array.from({ length: 80 }).map((_, i) => ({
  x: i,
  y: Math.log(i + 1) * 20,
}))

const SContainer = styled.div`
  width: 500px;
  height: 300px;
`

const Template: ComponentStory<typeof GraphComponent> = (args) => (
  <SContainer>
    <GraphComponent {...args} />
  </SContainer>
)

export const Graph = Template.bind({})
Graph.args = {
  labelX: "Days",
  labelY: "Rewards APR %",
  data,
}
