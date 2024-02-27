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
        label="Advanced settings"
      />
    </SwitchContainer>
  )
}

export const Default: Story = {
  render: Template,
}

export const Disabled: Story = {
  render: Template,
  args: {
    disabled: true,
  },
}

export const Small: Story = {
  render: Template,
  args: {
    size: "small",
  },
}

export const Medium: Story = {
  render: Template,
  args: {
    size: "medium",
  },
}

export const Large: Story = {
  render: Template,
  args: {
    size: "large",
  },
}

export const LabelPosition: Story = {
  render: Template,
  args: {
    labelPosition: "end",
  },
}
