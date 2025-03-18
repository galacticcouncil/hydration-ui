import { SxProp } from "@theme-ui/core"
import { forwardRef } from "react"

import { Text } from "../Text"
import { CustomInputProps, SInput, SInputContainer } from "./Input.styled"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  CustomInputProps & {
    iconStart?: React.ComponentType
    iconEnd?: React.ComponentType
    unit?: string
    containerSx?: SxProp["sx"]
  }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      iconStart: IconStart,
      iconEnd: IconEnd,
      unit,
      variant,
      customSize,
      containerSx,
      ...props
    },
    ref,
  ) => (
    <SInputContainer variant={variant} customSize={customSize} sx={containerSx}>
      {IconStart && <IconStart />}
      <SInput ref={ref} {...props} />
      {unit && <Text>{unit}</Text>}
      {IconEnd && <IconEnd />}
    </SInputContainer>
  ),
)
Input.displayName = "Input"
