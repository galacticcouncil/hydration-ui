import { FC, Ref } from "react"

import { getToken } from "@/utils"

import { Text } from "../Text"
import { CustomInputProps, SInput, SInputContainer } from "./Input.styled"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  CustomInputProps & {
    isError?: boolean
    iconStart?: React.ComponentType
    iconEnd?: React.ComponentType
    unit?: string
    className?: string
    ref?: Ref<HTMLInputElement>
  }

export const Input: FC<InputProps> = ({
  iconStart: IconStart,
  iconEnd: IconEnd,
  unit,
  variant,
  customSize,
  className,
  ref,
  ...props
}) => (
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
)
