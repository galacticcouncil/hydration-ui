import React from "react"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Graph as GraphComponent } from "./Graph"
import styled from "styled-components/macro"
import SatoshiVariable from "assets/fonts/SatoshiVariable.ttf"

export default {
  title: "components/Graph",
  component: GraphComponent,
} as ComponentMeta<typeof GraphComponent>

const data = Array.from({ length: 80 }).map((_, i) => ({
  x: i,
  y: Math.log(i + 1) * 20,
}))

const StyledContainer = styled.div`
  // TODO: remove font styles and move to some global storybook config
  @font-face {
    font-family: "SatoshiVariable";
    src: local("SatoshiVariable"), url(${SatoshiVariable}) format("truetype");
    font-display: swap;
    font-weight: 100 900;
  }

  width: 500px;
  height: 300px;
  font-family: "SatoshiVariable", sans-serif;
`

const Template: ComponentStory<typeof GraphComponent> = (args) => (
  <StyledContainer>
    <GraphComponent {...args} />
  </StyledContainer>
)

export const Graph = Template.bind({})
Graph.args = {
  labelX: "Days",
  labelY: "Rewards APR %",
  data,
}
