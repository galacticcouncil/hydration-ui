import * as React from "react"
import * as UI from "@galacticcouncil/ui"
import { createComponent, EventName } from "@lit-labs/react"

export const UigcToggleButtonGroup = createComponent({
  tagName: "uigc-toggle-button-group",
  elementClass: UI.ToggleButtonGroup,
  react: React,
  events: {
    onToggleButtonClick: "toggle-button-click" as EventName<CustomEvent>,
  },
})

export const UigcToggleButton = createComponent({
  tagName: "uigc-toggle-button",
  elementClass: UI.ToggleButton,
  react: React,
})

const Option = (opt: string) => (
  <UigcToggleButton
    ref={(el) => el && el.setAttribute("value", opt)}
    sx={{ fontSize: 10 }}
    {...{ size: "small" }}
  >
    {opt.toUpperCase()}
  </UigcToggleButton>
)

export function PartialOrderToggle(props: {
  partial: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <UigcToggleButtonGroup
      value={props.partial ? "yes" : "no"}
      onToggleButtonClick={(e) => {
        props.onChange(e.detail.value === "yes" ? true : false)
      }}
      {...{ variant: "dense" }}
    >
      {Option("yes")}
      {Option("no")}
    </UigcToggleButtonGroup>
  )
}
