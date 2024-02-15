import styled from "@emotion/styled"
import { Meta, StoryObj } from "@storybook/react"
import { ComponentPropsWithoutRef, useState } from "react"
import { Switch } from "./Switch"

type Story = StoryObj<typeof Switch>

export default {
  component: Switch,
} as Meta<typeof Switch>

const SwitchContainer = styled.div`
  padding: 20px;
`

const Template = (props: ComponentPropsWithoutRef<typeof Switch>) => {
  const [value, setValue] = useState(false)
  return (
    <SwitchContainer>
      <Switch
        {...props}
        value={value}
        onCheckedChange={() => setValue((value) => !value)}
        name="switch"
        label="Regular Switch"
      />
    </SwitchContainer>
  )
}

export const Regular: Story = {
  render: Template,
}

export const Small: Story = {
  render: Template,
  args: {
    size: "small",
  },
}

export const Disabled: Story = {
  render: Template,
  args: {
    disabled: true,
  },
}
