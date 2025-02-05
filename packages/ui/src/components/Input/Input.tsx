import { forwardRef } from "react"

import { Text } from "../Text"
import { CustomInputProps, SInput, SInputContainer } from "./Input.styled"
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  CustomInputProps & {
    iconStart?: React.ComponentType
    iconEnd?: React.ComponentType
    unit?: string
  }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      iconStart: IconStart,
      iconEnd: IconEnd,
      unit,
      variant,
      customSize,
      ...props
    },
    ref,
  ) => (
    <SInputContainer variant={variant} customSize={customSize}>
      {IconStart && <IconStart data-slot="icon" />}
      <SInput ref={ref} {...props} />
      {unit && <Text>{unit}</Text>}
      {IconEnd && <IconEnd data-slot="icon" />}
    </SInputContainer>
  ),
)
Input.displayName = "Input"
