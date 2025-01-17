import { forwardRef } from "react"

import { CustomInputProps, SInput, SInputGroup } from "./Input.styled"
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  CustomInputProps & {
    iconStart?: React.ComponentType
    iconEnd?: React.ComponentType
  }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ iconStart: IconStart, iconEnd: IconEnd, ...props }, ref) => (
    <SInputGroup disabled={props.disabled} customSize={props.customSize}>
      {IconStart && <IconStart data-slot="icon" />}
      <SInput ref={ref} {...props} />
      {IconEnd && <IconEnd data-slot="icon" />}
    </SInputGroup>
  ),
)
Input.displayName = "Input"
