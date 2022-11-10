import styled from "@emotion/styled"
import { ComponentMeta } from "@storybook/react"
import { useState } from "react"
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { Input } from "./Input"

export default {
  title: "components/Input/Input",
  component: Input,
} as ComponentMeta<typeof Input>

const SwitchContainer = styled.div`
  background: #00041d;
  height: 200px;
  padding: 20px;
`

export const InputRegular = () => {
  const [value, setValue] = useState("")
  return (
    <SwitchContainer>
      <Input
        value={value}
        onChange={setValue}
        name="input"
        label="Input"
        withLabel
      />
    </SwitchContainer>
  )
}

export const InputWithUnit = () => {
  const [value, setValue] = useState("")
  return (
    <SwitchContainer>
      <Input
        value={value}
        onChange={setValue}
        name="input"
        label="Input"
        unit="BSX"
        withLabel
      />
    </SwitchContainer>
  )
}

export const InputError = () => {
  const [value, setValue] = useState("")
  return (
    <SwitchContainer>
      <Input
        value={value}
        onChange={setValue}
        name="input"
        label="Input"
        unit="BSX"
        error="generic error"
        withLabel
      />
    </SwitchContainer>
  )
}

export const InputPlaceholder = () => {
  const [value, setValue] = useState("")
  return (
    <SwitchContainer>
      <Input
        value={value}
        onChange={setValue}
        name="input"
        label="Input"
        unit="BSX"
        placeholder="00.00"
        withLabel
      />
    </SwitchContainer>
  )
}

export const InputTooltip = () => {
  const [value, setValue] = useState("")
  return (
    <TooltipProvider>
      <SwitchContainer>
        <Input
          value={value}
          onChange={setValue}
          name="input"
          label="Input"
          unit="BSX"
          placeholder="00.00"
          withLabel
          tooltip="The hidden information"
        />
      </SwitchContainer>
    </TooltipProvider>
  )
}
