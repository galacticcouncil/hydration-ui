import { Indicator } from "@radix-ui/react-checkbox"
import { forwardRef } from "react"

import { SIndicator, SRoot, TCheckbox } from "./Checkbox.styled"

export const Checkbox = forwardRef<HTMLButtonElement, TCheckbox>(
  ({ name, size = "medium", ...props }, ref) => (
    <SRoot ref={ref} size={size} name={name} id={name} {...props}>
      <Indicator>
        <SIndicator />
      </Indicator>
    </SRoot>
  ),
)

Checkbox.displayName = "Checkbox"
