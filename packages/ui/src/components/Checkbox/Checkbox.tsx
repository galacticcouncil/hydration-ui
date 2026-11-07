import { Indicator } from "@radix-ui/react-checkbox"
import { FC } from "react"

import { LabelProps } from "@/components/Label"

import { CheckboxProps, SIndicator, SLabel, SRoot } from "./Checkbox.styled"

export const Checkbox: FC<CheckboxProps> = ({
  name,
  size = "medium",
  ...props
}) => (
  <SRoot size={size} name={name} id={name} {...props}>
    <Indicator>
      <SIndicator size={size} />
    </Indicator>
  </SRoot>
)

export const CheckboxLabel: FC<LabelProps> = (props) => (
  <SLabel fs="p4" lh={1.2} fw={500} {...props} />
)
