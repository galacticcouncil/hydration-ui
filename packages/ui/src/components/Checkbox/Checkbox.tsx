import { Indicator } from "@radix-ui/react-checkbox"
import { FC } from "react"

import { SIndicator, SRoot, TCheckbox } from "./Checkbox.styled"

export const Checkbox: FC<TCheckbox> = ({
  name,
  size = "medium",
  ...props
}) => (
  <SRoot size={size} name={name} id={name} {...props}>
    <Indicator>
      <SIndicator />
    </Indicator>
  </SRoot>
)
