import styled from "@emotion/styled"
import { ComponentMeta } from "@storybook/react"
import { useState } from "react"
import { Switch } from "./Switch"

export default {
  title: "components/Switch/Switch",
  component: Switch,
} as ComponentMeta<typeof Switch>

const SwitchContainer = styled.div`
  background: #00041d;
`

export const SwitchRegular = () => {
  const [value, setValue] = useState(false)
  return (
    <SwitchContainer>
      <Switch
        value={value}
        onCheckedChange={() => setValue((value) => !value)}
        name="regular"
        label="Regular Switch"
      />
    </SwitchContainer>
  )
}

export const SwitchSmall = () => {
  const [value, setValue] = useState(false)
  return (
    <SwitchContainer>
      <Switch
        value={value}
        onCheckedChange={() => setValue((value) => !value)}
        size="small"
        name="small"
        label="Small Switch"
      />
    </SwitchContainer>
  )
}

export const SwitchDisabled = () => {
  const [value, setValue] = useState(true)
  return (
    <SwitchContainer>
      <Switch
        value={value}
        onCheckedChange={() => setValue((value) => !value)}
        size="small"
        disabled
        name="disabled"
        label="Disabled Switcher"
      />
    </SwitchContainer>
  )
}
