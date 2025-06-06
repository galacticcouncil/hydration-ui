import { forwardRef } from "react"

import { getToken } from "@/utils"

import { Text } from "../Text"
import { CustomInputProps, SInput, SInputContainer } from "./Input.styled"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  CustomInputProps & {
    iconStart?: React.ComponentType
    iconEnd?: React.ComponentType
    unit?: string
    className?: string
  }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      iconStart: IconStart,
      iconEnd: IconEnd,
      unit,
      variant,
      customSize,
      className,
      ...props
    },
    ref,
  ) => (
    <SInputContainer
      variant={variant}
      customSize={customSize}
      className={className}
    >
      {IconStart && <IconStart />}
      <SInput ref={ref} {...props} />
      {unit && (
        <Text
          fs="p5"
          fw={600}
          color={getToken("text.medium")}
          whiteSpace="nowrap"
        >
          {unit}
        </Text>
      )}
      {IconEnd && <IconEnd />}
    </SInputContainer>
  ),
)
Input.displayName = "Input"
